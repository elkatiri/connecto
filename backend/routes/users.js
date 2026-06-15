const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.replace('Bearer ', ''), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/me', auth, async (req, res) => {
  try {
    const { interests, preferredMode } = req.body;
    const update = {};
    if (interests) update.interests = interests;
    if (preferredMode) update.preferredMode = preferredMode;
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;
