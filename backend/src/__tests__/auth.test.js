const crypto = require('crypto');
const { verifyTelegramInitData } = require('../middleware/auth');

const BOT_TOKEN = 'test_bot_token_12345';

function buildInitData(user, overrides = {}) {
  const authDate = Math.floor(Date.now() / 1000);
  const params = new URLSearchParams({
    auth_date: String(authDate),
    user: JSON.stringify(user),
    query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
    ...overrides,
  });

  // Строим data_check_string: все поля кроме hash, отсортированные
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  params.set('hash', hash);
  return params.toString();
}

describe('verifyTelegramInitData', () => {
  const user = { id: 123456789, first_name: 'Ivan', last_name: 'Petrov' };

  test('возвращает пользователя при корректном initData', () => {
    const initData = buildInitData(user);
    const result = verifyTelegramInitData(initData, BOT_TOKEN);
    expect(result).not.toBeNull();
    expect(result.id).toBe(user.id);
    expect(result.first_name).toBe(user.first_name);
  });

  test('возвращает null при неверном hash', () => {
    const initData = buildInitData(user);
    const tampered = initData.replace(/hash=[^&]+/, 'hash=deadbeef1234567890');
    const result = verifyTelegramInitData(tampered, BOT_TOKEN);
    expect(result).toBeNull();
  });

  test('возвращает null при неверном bot token', () => {
    const initData = buildInitData(user);
    const result = verifyTelegramInitData(initData, 'wrong_token');
    expect(result).toBeNull();
  });

  test('возвращает null при отсутствующем hash', () => {
    const params = new URLSearchParams({
      auth_date: String(Math.floor(Date.now() / 1000)),
      user: JSON.stringify(user),
    });
    const result = verifyTelegramInitData(params.toString(), BOT_TOKEN);
    expect(result).toBeNull();
  });

  test('возвращает null при просроченном auth_date (> 1 час)', () => {
    const expiredDate = Math.floor(Date.now() / 1000) - 3700;
    const initData = buildInitData(user, { auth_date: String(expiredDate) });
    // Пересчитываем hash с устаревшей датой
    const result = verifyTelegramInitData(initData, BOT_TOKEN);
    expect(result).toBeNull();
  });

  test('обрабатывает пользователей без last_name', () => {
    const minUser = { id: 42, first_name: 'Solo' };
    const initData = buildInitData(minUser);
    const result = verifyTelegramInitData(initData, BOT_TOKEN);
    expect(result).not.toBeNull();
    expect(result.id).toBe(42);
  });
});
