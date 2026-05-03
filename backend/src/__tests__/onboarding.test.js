const request = require('supertest');
const { execSync } = require('child_process');
const path = require('path');

beforeAll(() => {
  execSync('npx prisma db push --force-reset --accept-data-loss', {
    cwd: path.join(__dirname, '../..'),
    env: { ...process.env },
    stdio: 'pipe',
  });
});

const app = require('../app');
const { prisma } = require('../database/connection');

beforeAll(async () => {
  await prisma.$connect();
  await prisma.skillCategory.create({
    data: { key: 'intro', title: 'Знакомство', order_index: 0 },
  });
  await prisma.skill.create({
    data: {
      key: 'intro.name',
      category_key: 'intro',
      title: 'Имя',
      order_index: 0,
      target_bones: 5,
    },
  });
  const route = await prisma.route.create({
    data: {
      key: 'puppy-basics',
      title: 'Щенок с нуля',
      order_index: 0,
      age_min_months: 0,
      age_max_months: 6,
    },
  });
  await prisma.routeSkill.create({
    data: {
      route_id: route.id,
      skill_key: 'intro.name',
      order_index: 0,
      is_required: true,
    },
  });
  const course = await prisma.course.create({
    data: { title: 'Тест-курс', is_active: true },
  });
  const mod = await prisma.module.create({
    data: { course_id: course.id, title: 'Модуль 1', order_index: 0, is_active: true },
  });
  await prisma.lesson.create({
    data: {
      module_id: mod.id,
      title: 'Урок имени',
      order_index: 0,
      is_active: true,
      meta: JSON.stringify({ skill_key: 'intro.name' }),
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.user.deleteMany({});
});

describe('POST /api/onboarding/complete', () => {
  test('400 при неверной корзине возраста', async () => {
    const res = await request(app)
      .post('/api/onboarding/complete')
      .send({ petName: 'Бобик', dog_age_bucket: 'invalid' });
    expect(res.status).toBe(400);
  });

  test('назначает маршрут и возвращает первый урок (щенок)', async () => {
    const res = await request(app)
      .post('/api/onboarding/complete')
      .send({ petName: 'Бобик', dog_age_bucket: 'under6mo' });

    expect(res.status).toBe(200);
    expect(res.body.route_key).toBe('puppy-basics');
    expect(res.body.profile.petName).toBe('Бобик');
    expect(res.body.profile.onboardingCompleted).toBe(true);
    expect(res.body.profile.selectedRouteKey).toBe('puppy-basics');
    expect(typeof res.body.first_lesson_id).toBe('number');
  });
});
