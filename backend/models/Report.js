const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: String, required: true },
  reportedId: { type: String, required: true },
  reason: {
    type: String,
    enum: ['inappropriate', 'spam', 'harassment', 'nudity'],
    required: true,
  },
  sessionId: { type: String },
  reviewed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
