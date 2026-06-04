const validUrl = require('valid-url');
const bcrypt = require('bcryptjs');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const { generateUniqueShortCode, isValidAlias } = require('../utils/shortCode');
const { getCachedUrl, setCachedUrl, deleteCachedUrl } = require('../services/cacheService');
const { parseUserAgent } = require('../utils/userAgent');

const buildShortUrl = (code) => `${process.env.BASE_URL}/${code}`;

exports.shortenUrl = async (req, res, next) => {
  try {
    const { originalUrl, alias, expiresAt, password } = req.body;

    if (!validUrl.isUri(originalUrl)) {
      return res.status(400).json({ success: false, message: 'Invalid URL format.' });
    }

    let shortCode;

    if (alias) {
      if (!isValidAlias(alias)) {
        return res.status(400).json({
          success: false,
          message: 'Alias must be 3-30 characters and contain only letters, numbers, hyphens, or underscores.',
        });
      }

      const existingAlias = await Url.findOne({ shortCode: alias });
      if (existingAlias) {
        return res.status(409).json({ success: false, message: 'Custom alias already taken.' });
      }
      shortCode = alias;
    } else {
      shortCode = await generateUniqueShortCode(Url);
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date.' });
      }
      if (expiryDate <= new Date()) {
        return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' });
      }
    }

    const urlDoc = await Url.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      customAlias: alias || null,
      password: hashedPassword,
      expiresAt: expiryDate,
    });

    const cacheData = {
      originalUrl: urlDoc.originalUrl,
      hasPassword: !!urlDoc.password,
      expiresAt: urlDoc.expiresAt,
    };
    await setCachedUrl(shortCode, cacheData);

    res.status(201).json({
      success: true,
      shortUrl: buildShortUrl(shortCode),
      url: {
        id: urlDoc._id,
        originalUrl: urlDoc.originalUrl,
        shortCode: urlDoc.shortCode,
        shortUrl: buildShortUrl(shortCode),
        customAlias: urlDoc.customAlias,
        clicks: urlDoc.clicks,
        expiresAt: urlDoc.expiresAt,
        hasPassword: !!urlDoc.password,
        createdAt: urlDoc.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUrls = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { userId: req.user._id };

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ originalUrl: regex }, { shortCode: regex }, { customAlias: regex }];
    }

    const urls = await Url.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: urls.length,
      urls: urls.map((url) => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: buildShortUrl(url.shortCode),
        customAlias: url.customAlias,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        hasPassword: !!url.password,
        createdAt: url.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this URL.' });
    }

    await deleteCachedUrl(url.shortCode);
    await Analytics.deleteMany({ shortCode: url.shortCode });
    await url.deleteOne();

    res.json({ success: true, message: 'URL deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.updateUrl = async (req, res, next) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({ success: false, message: 'URL not found.' });
    }

    if (url.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this URL.' });
    }

    const { password, expiresAt } = req.body;

    if (password !== undefined) {
      if (password === '') {
        url.password = null;
      } else {
        url.password = await bcrypt.hash(password, 12);
      }
    }

    if (expiresAt !== undefined) {
      if (expiresAt === '') {
        url.expiresAt = null;
      } else {
        const expiryDate = new Date(expiresAt);
        if (isNaN(expiryDate.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid expiry date.' });
        }
        if (expiryDate <= new Date()) {
          return res.status(400).json({ success: false, message: 'Expiry date must be in the future.' });
        }
        url.expiresAt = expiryDate;
      }
    }

    await url.save();
    await deleteCachedUrl(url.shortCode);

    res.json({
      success: true,
      url: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: buildShortUrl(url.shortCode),
        customAlias: url.customAlias,
        clicks: url.clicks,
        expiresAt: url.expiresAt,
        hasPassword: !!url.password,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUrlInfo = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    let urlData = await getCachedUrl(shortCode);

    if (!urlData) {
      const urlDoc = await Url.findOne({ shortCode });
      if (!urlDoc) {
        return res.status(404).json({ success: false, message: 'Short URL not found.' });
      }
      urlData = {
        originalUrl: urlDoc.originalUrl,
        hasPassword: !!urlDoc.password,
        expiresAt: urlDoc.expiresAt,
      };
    }

    if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired.', expired: true });
    }

    res.json({
      success: true,
      shortCode,
      hasPassword: urlData.hasPassword,
      requiresPassword: urlData.hasPassword,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPassword = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;

    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) {
      return res.status(404).json({ success: false, message: 'Short URL not found.' });
    }

    if (urlDoc.expiresAt && urlDoc.expiresAt < new Date()) {
      return res.status(410).json({ success: false, message: 'This link has expired.', expired: true });
    }

    if (!urlDoc.password) {
      return res.json({ success: true, originalUrl: urlDoc.originalUrl });
    }

    const isMatch = await bcrypt.compare(password, urlDoc.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    res.json({ success: true, originalUrl: urlDoc.originalUrl });
  } catch (error) {
    next(error);
  }
};

const trackClick = async (shortCode, req) => {
  const { browser, device } = parseUserAgent(req.headers['user-agent']);

  await Url.updateOne({ shortCode }, { $inc: { clicks: 1 } });
  await Analytics.create({ shortCode, browser, device, timestamp: new Date() });
};

exports.redirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (shortCode.startsWith('api') || ['favicon.ico', 'robots.txt'].includes(shortCode)) {
      return next();
    }

    let urlData = await getCachedUrl(shortCode);
    let cacheHit = !!urlData;

    if (!urlData) {
      const urlDoc = await Url.findOne({ shortCode });
      if (!urlDoc) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        if (req.accepts('html')) {
          return res.redirect(`${frontendUrl}/link-not-found`);
        }
        return res.status(404).json({ success: false, message: 'Short URL not found.' });
      }

      urlData = {
        originalUrl: urlDoc.originalUrl,
        hasPassword: !!urlDoc.password,
        expiresAt: urlDoc.expiresAt,
      };

      await setCachedUrl(shortCode, urlData);
    }

    if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (req.accepts('html')) {
        return res.redirect(`${frontendUrl}/expired`);
      }
      return res.status(410).json({
        success: false,
        message: 'This link has expired.',
        expired: true,
      });
    }

    if (urlData.hasPassword) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/verify/${shortCode}`);
    }

    trackClick(shortCode, req).catch((err) =>
      console.error('Analytics tracking error:', err.message)
    );

    res.set('X-Cache', cacheHit ? 'HIT' : 'MISS');
    return res.redirect(301, urlData.originalUrl);
  } catch (error) {
    next(error);
  }
};

exports.trackVerifiedRedirect = async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const urlDoc = await Url.findOne({ shortCode });

    if (!urlDoc) {
      return res.status(404).json({ success: false, message: 'Short URL not found.' });
    }

    trackClick(shortCode, req).catch((err) =>
      console.error('Analytics tracking error:', err.message)
    );

    res.json({ success: true, message: 'Click tracked.' });
  } catch (error) {
    next(error);
  }
};
