const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    customAlias: {
      type: String,
      default: null,
      sparse: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

urlSchema.index({ userId: 1 });
urlSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);
