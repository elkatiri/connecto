const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

const sign = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/anonymous', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const user = await User.create({ sessionId, isAnonymous: true });
    res.json({ token: sign(user._id), sessionId, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create anonymous session' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ email, password });
    res.status(201).json({ token: sign(user._id), userId: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    if (user.isBanned)
      return res.status(403).json({ error: 'Account banned' });

    user.lastSeen = new Date();
    await user.save();
    res.json({ token: sign(user._id), userId: user._id });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
