const request = require('supertest');
const { execSync } = require('child_process');
const path = require('path');

// setup.js выставил DATABASE_URL на file-based test.db
// Поднимаем схему перед тестами
beforeAll(() => {
  execSync('npx prisma db push --force-reset --accept-data-loss', {
    cwd: path.join(__dirname, '../..'),
    env: { ...process.env },
    stdio: 'pipe',
  });
});

// Импортируем app ПОСЛЕ того, как setup.js выставил переменные
const app = require('../app');
const { prisma } = require('../database/connection');

// Создаём тестовый трек в БД перед всеми тестами
let testTrack;
beforeAll(async () => {
  await prisma.$connect();
  testTrack = await prisma.track.create({
    data: { title: 'Тест трек', duration_days: 5, is_active: true },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Сбрасываем userTrack перед каждым тестом (кроме создания трека)
afterEach(async () => {
  await prisma.userTrack.deleteMany({});
  await prisma.user.deleteMany({});
});

describe('GET /api/user/tracks', () => {
  test('возвращает пустой список для нового пользователя', async () => {
    const res = await request(app).get('/api/user/tracks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/user/tracks', () => {
  test('добавляет трек пользователю', async () => {
    const res = await request(app)
      .post('/api/user/tracks')
      .send({ track_id: testTrack.id });

    expect(res.status).toBe(201);
    expect(res.body.track_id).toBe(testTrack.id);
    expect(res.body.days_remaining).toBe(testTrack.duration_days);
  });

  test('возвращает 400 без track_id', async () => {
    const res = await request(app).post('/api/user/tracks').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/track_id/);
  });

  test('возвращает 409 при повторном добавлении', async () => {
    await request(app).post('/api/user/tracks').send({ track_id: testTrack.id });
    const res = await request(app).post('/api/user/tracks').send({ track_id: testTrack.id });
    expect(res.status).toBe(409);
  });

  test('возвращает 404 для несуществующего трека', async () => {
    const res = await request(app).post('/api/user/tracks').send({ track_id: 99999 });
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/user/tracks/:trackId — выполнение задания', () => {
  beforeEach(async () => {
    await request(app).post('/api/user/tracks').send({ track_id: testTrack.id });
  });

  test('первое выполнение уменьшает days_remaining', async () => {
    const res = await request(app).put(`/api/user/tracks/${testTrack.id}`);
    expect(res.status).toBe(200);
    expect(res.body.userTrack.days_remaining).toBe(testTrack.duration_days - 1);
    expect(res.body.userTrack.last_completed_at).not.toBeNull();
  });

  test('cooldown: второе выполнение подряд отклоняется', async () => {
    await request(app).put(`/api/user/tracks/${testTrack.id}`);
    const res = await request(app).put(`/api/user/tracks/${testTrack.id}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/мин/);
  });

  test('возвращает 404 для трека, не добавленного пользователем', async () => {
    const res = await request(app).put('/api/user/tracks/99999');
    expect(res.status).toBe(404);
  });

  test('возвращает 400 для нечислового trackId', async () => {
    const res = await request(app).put('/api/user/tracks/abc');
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/user/tracks/:trackId', () => {
  beforeEach(async () => {
    await request(app).post('/api/user/tracks').send({ track_id: testTrack.id });
  });

  test('удаляет трек', async () => {
    const res = await request(app).delete(`/api/user/tracks/${testTrack.id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/удалён/);
  });

  test('возвращает 404 для отсутствующего трека', async () => {
    const res = await request(app).delete('/api/user/tracks/99999');
    expect(res.status).toBe(404);
  });
});
