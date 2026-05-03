const { prisma } = require('../database/connection');
const { lessonMatchesSkill } = require('./lessonSkillMeta');

/** Маршрут по умолчанию, если bucket неизвестен */
const DEFAULT_ROUTE = 'foundations';

/**
 * Назначение персонального маршрута по возрастной корзине (согласовано с seed ROUTES).
 * @param {'under6mo'|'6mo_2y'|'older'} bucket
 */
function routeKeyForAgeBucket(bucket) {
  switch (bucket) {
    case 'under6mo':
      return 'puppy-basics';
    case '6mo_2y':
      return 'foundations';
    case 'older':
      return 'city-dog';
    default:
      return DEFAULT_ROUTE;
  }
}

/**
 * Первый урок первого атома маршрута (как в GET /api/skills/:key/lessons).
 */
async function getFirstLessonIdForRoute(routeKey) {
  const route = await prisma.route.findUnique({
    where: { key: routeKey },
    include: {
      skills: { orderBy: { order_index: 'asc' }, take: 1 },
    },
  });
  if (!route?.skills?.length) return null;

  const skillKey = route.skills[0].skill_key;
  const lessons = await prisma.lesson.findMany({
    where: { is_active: true },
    orderBy: [
      { module: { course: { id: 'asc' } } },
      { module: { order_index: 'asc' } },
      { order_index: 'asc' },
    ],
  });
  const first = lessons.find((l) => lessonMatchesSkill(l.meta, skillKey));
  return first ? first.id : null;
}

module.exports = {
  routeKeyForAgeBucket,
  getFirstLessonIdForRoute,
  DEFAULT_ROUTE,
};
