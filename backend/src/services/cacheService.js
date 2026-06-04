const { getRedis } = require('../config/redis');

const CACHE_TTL = 3600;

const getCachedUrl = async (shortCode) => {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const cached = await redis.get(`url:${shortCode}`);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

const setCachedUrl = async (shortCode, data) => {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.setex(`url:${shortCode}`, CACHE_TTL, JSON.stringify(data));
  } catch (err) {
    console.error('Redis cache set error:', err.message);
  }
};

const deleteCachedUrl = async (shortCode) => {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(`url:${shortCode}`);
  } catch (err) {
    console.error('Redis cache delete error:', err.message);
  }
};

module.exports = { getCachedUrl, setCachedUrl, deleteCachedUrl, CACHE_TTL };
