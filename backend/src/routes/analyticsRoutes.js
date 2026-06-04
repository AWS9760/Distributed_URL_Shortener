const express = require('express');
const {
  getOverview,
  getBrowserStats,
  getClicksPerDay,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', protect, getOverview);
router.get('/browser-stats', protect, getBrowserStats);
router.get('/clicks-per-day', protect, getClicksPerDay);

module.exports = router;
