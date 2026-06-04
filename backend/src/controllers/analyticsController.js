const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const urls = await Url.find({ userId });
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);

    const topUrls = [...urls]
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)
      .map((url) => ({
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        clicks: url.clicks,
      }));

    res.json({
      success: true,
      overview: {
        totalUrls,
        totalClicks,
        topUrls,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBrowserStats = async (req, res, next) => {
  try {
    const userUrls = await Url.find({ userId: req.user._id }).select('shortCode');
    const shortCodes = userUrls.map((u) => u.shortCode);

    const stats = await Analytics.aggregate([
      { $match: { shortCode: { $in: shortCodes } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      browserStats: stats.map((s) => ({ browser: s._id, count: s.count })),
    });
  } catch (error) {
    next(error);
  }
};

exports.getClicksPerDay = async (req, res, next) => {
  try {
    const userUrls = await Url.find({ userId: req.user._id }).select('shortCode');
    const shortCodes = userUrls.map((u) => u.shortCode);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksPerDay = await Analytics.aggregate([
      {
        $match: {
          shortCode: { $in: shortCodes },
          timestamp: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp', timezone: 'Asia/Karachi' },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      clicksPerDay: clicksPerDay.map((d) => ({ date: d._id, clicks: d.clicks })),
    });
  } catch (error) {
    next(error);
  }
};
