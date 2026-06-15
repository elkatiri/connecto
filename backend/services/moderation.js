const Report = require('../models/Report');
const User = require('../models/User');

const BANNED_KEYWORDS = [
  'spam', 'scam', 'porn', 'nude', 'xxx', 'onlyfans', 'cashapp', 'venmo',
  'telegram', 'whatsapp me', 'click here', 'free money',
];

function filterMessage(text) {
  const lower = text.toLowerCase();
  return BANNED_KEYWORDS.some((kw) => lower.includes(kw));
}

async function reportUser({ reporterId, reportedId, reason, sessionId }) {
  const report = await Report.create({ reporterId, reportedId, reason, sessionId });

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await Report.countDocuments({
    reportedId,
    createdAt: { $gte: cutoff },
  });

  if (recentCount >= 3) {
    await User.findOneAndUpdate(
      { sessionId: reportedId },
      { isBanned: true }
    );
  }

  return report;
}

module.exports = { reportUser, filterMessage };
