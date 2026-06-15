const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  password: { type: String },
  isAnonymous: { type: Boolean, default: false },
  interests: [{ type: String }],
  preferredMode: { type: String, enum: ['video', 'text'], default: 'video' },
  reportCount: { type: Number, default: 0 },
  isBanned: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
