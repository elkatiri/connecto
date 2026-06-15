const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  participants: [{ type: String }],
  mode: { type: String, enum: ['video', 'text'], required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number },
  messageCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Session', sessionSchema);
