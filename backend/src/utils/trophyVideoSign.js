const crypto = require('crypto');

function getSecret() {
  return process.env.VIDEO_SIGNING_SECRET || process.env.BOT_TOKEN || 'dev_trophy_video_secret';
}

/** Query string для GET /api/media/trophy/:id (без initData в <video>) */
function trophyStreamQuery(userId, videoId) {
  const exp = Date.now() + 7 * 86400000;
  const raw = `${userId}:${videoId}:${exp}`;
  const sig = crypto.createHmac('sha256', getSecret()).update(raw).digest('hex');
  return `?e=${exp}&s=${sig}`;
}

function verifyTrophyStream(userId, videoId, exp, sig) {
  const e = parseInt(exp, 10);
  if (!Number.isFinite(e) || Date.now() > e) return false;
  if (!sig || typeof sig !== 'string') return false;
  const raw = `${userId}:${videoId}:${e}`;
  const expected = crypto.createHmac('sha256', getSecret()).update(raw).digest('hex');
  return expected === sig;
}

module.exports = { trophyStreamQuery, verifyTrophyStream };
