const router = require('express').Router();
const { reportUser } = require('../services/moderation');

router.post('/', async (req, res) => {
  try {
    const { reporterId, reportedId, reason, sessionId } = req.body;
    if (!reporterId || !reportedId || !reason)
      return res.status(400).json({ error: 'reporterId, reportedId, and reason are required' });

    const validReasons = ['inappropriate', 'spam', 'harassment', 'nudity'];
    if (!validReasons.includes(reason))
      return res.status(400).json({ error: 'Invalid reason' });

    const report = await reportUser({ reporterId, reportedId, reason, sessionId });
    res.status(201).json({ success: true, reportId: report._id });
  } catch (err) {
    res.status(500).json({ error: 'Report submission failed' });
  }
});

module.exports = router;
