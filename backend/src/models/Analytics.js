const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    index: true,
  },
  browser: {
    type: String,
    default: 'Unknown',
  },
  device: {
    type: String,
    default: 'Unknown',
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

analyticsSchema.index({ shortCode: 1, timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
