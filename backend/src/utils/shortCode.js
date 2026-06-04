const { customAlphabet } = require('nanoid');

const generateShortCode = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  7
);

const generateUniqueShortCode = async (UrlModel, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateShortCode();
    const existing = await UrlModel.findOne({ shortCode: code }).select('_id');
    if (!existing) return code;
  }
  throw new Error('Unable to generate unique short code. Please try again.');
};

const isValidAlias = (alias) => /^[a-zA-Z0-9_-]{3,30}$/.test(alias);

module.exports = { generateUniqueShortCode, isValidAlias };
