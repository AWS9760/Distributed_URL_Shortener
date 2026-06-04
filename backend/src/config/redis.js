const Redis = require('ioredis');

let redis = null;

const connectRedis = () => {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });

    redis.on('connect', () => console.log('Redis connected'));
    redis.on('error', (err) => console.error('Redis error:', err.message));

    return redis;
  } catch (error) {
    console.error('Redis connection error:', error.message);
    return null;
  }
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
