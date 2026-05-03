const GRACE_MS_DEFAULT = 3 * 24 * 60 * 60 * 1000;

function graceMs() {
  const n = parseInt(process.env.TIER_GRACE_DAYS || '3', 10);
  return (Number.isFinite(n) && n >= 0 ? n : 3) * 24 * 60 * 60 * 1000;
}

/** Активная подписка Pro (включая soft-grace после expiry) */
function isUserProEffective(user) {
  if (!user || user.tier !== 'pro') return false;
  const exp = user.tier_expires_at;
  if (!exp) return true;
  const end = new Date(exp).getTime();
  if (Number.isNaN(end)) return false;
  return Date.now() <= end + graceMs();
}

/** Оплаченный период без grace (для отображения «до даты») */
function isWithinPaidPeriod(user) {
  if (!user || user.tier !== 'pro') return false;
  const exp = user.tier_expires_at;
  if (!exp) return true;
  const end = new Date(exp).getTime();
  return !Number.isNaN(end) && Date.now() <= end;
}

function proDaysToAdd() {
  const d = parseInt(process.env.PRO_SUBSCRIPTION_DAYS || '30', 10);
  return Number.isFinite(d) && d > 0 ? d : 30;
}

/** Продлить Pro с max(сейчас, текущий конец) + N дней */
function computeNewTierExpiresAt(user, now = new Date()) {
  const add = proDaysToAdd() * 86400000;
  const cur = user?.tier_expires_at ? new Date(user.tier_expires_at).getTime() : 0;
  const nowMs = now.getTime();
  const base = user?.tier === 'pro' && cur > nowMs ? cur : nowMs;
  return new Date(base + add);
}

module.exports = {
  isUserProEffective,
  isWithinPaidPeriod,
  computeNewTierExpiresAt,
  graceMs,
  GRACE_MS_DEFAULT,
};
