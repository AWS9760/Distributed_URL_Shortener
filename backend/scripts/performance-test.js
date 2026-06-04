/**
 * Performance comparison: MongoDB-only vs Redis-cached URL lookup
 * Run with: npm run test:performance (requires server running)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('ioredis');
const Url = require('../src/models/Url');

const ITERATIONS = 100;
const TEST_CODE = process.argv[2];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const redis = new Redis(process.env.REDIS_URL);

  let shortCode = TEST_CODE;
  if (!shortCode) {
    const url = await Url.findOne();
    if (!url) {
      console.log('No URLs in database. Create a URL first.');
      process.exit(1);
    }
    shortCode = url.shortCode;
  }

  console.log(`Testing with shortCode: ${shortCode}`);
  console.log(`Iterations: ${ITERATIONS}\n`);

  // MongoDB-only lookup
  const mongoStart = process.hrtime.bigint();
  for (let i = 0; i < ITERATIONS; i++) {
    await Url.findOne({ shortCode });
  }
  const mongoEnd = process.hrtime.bigint();
  const mongoMs = Number(mongoEnd - mongoStart) / 1e6;

  // Warm Redis cache
  const urlDoc = await Url.findOne({ shortCode });
  await redis.setex(
    `url:${shortCode}`,
    3600,
    JSON.stringify({
      originalUrl: urlDoc.originalUrl,
      hasPassword: !!urlDoc.password,
      expiresAt: urlDoc.expiresAt,
    })
  );

  // Redis-cached lookup
  const redisStart = process.hrtime.bigint();
  for (let i = 0; i < ITERATIONS; i++) {
    const cached = await redis.get(`url:${shortCode}`);
    if (cached) JSON.parse(cached);
  }
  const redisEnd = process.hrtime.bigint();
  const redisMs = Number(redisEnd - redisStart) / 1e6;

  console.log('Results:');
  console.log('─'.repeat(50));
  console.log(`MongoDB-only (${ITERATIONS} lookups): ${mongoMs.toFixed(2)} ms`);
  console.log(`  Average per lookup: ${(mongoMs / ITERATIONS).toFixed(3)} ms`);
  console.log(`Redis-cached (${ITERATIONS} lookups): ${redisMs.toFixed(2)} ms`);
  console.log(`  Average per lookup: ${(redisMs / ITERATIONS).toFixed(3)} ms`);
  console.log('─'.repeat(50));
  console.log(`Speed improvement: ${(mongoMs / redisMs).toFixed(1)}x faster with Redis`);

  await redis.quit();
  await mongoose.disconnect();
}

run().catch(console.error);
