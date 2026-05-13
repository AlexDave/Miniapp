const { prisma } = require('../database/connection');

/** Маршрут по умолчанию, если bucket неизвестен */
const DEFAULT_ROUTE = 'foundations';

/** slug курса в courses.json для каждого маршрута */
const ROUTE_TO_COURSE_SLUG = {
  'puppy-basics': 'puppy',
  'foundations': 'adult-standard',
  'city-dog': 'adult-standard',
  'calm-home': 'adult-standard',
};

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
 * Первый урок курса, привязанного к маршруту через slug из courses.json.
 * Надёжнее skill_key-матчинга: не зависит от того, какой skill_key стоит у урока.
 */
async function getFirstLessonIdForRoute(routeKey) {
  const slug = ROUTE_TO_COURSE_SLUG[routeKey] ?? 'adult-standard';

  const allCourses = await prisma.course.findMany({
    where: { is_active: true },
    select: { id: true, content: true },
  });

  const course = allCourses.find((c) => {
    try {
      return JSON.parse(c.content)?.slug === slug;
    } catch {
      return false;
    }
  });
  if (!course) return null;

  const lesson = await prisma.lesson.findFirst({
    where: { module: { course_id: course.id }, is_active: true },
    orderBy: [
      { module: { order_index: 'asc' } },
      { order_index: 'asc' },
    ],
  });
  return lesson?.id ?? null;
}

module.exports = {
  routeKeyForAgeBucket,
  getFirstLessonIdForRoute,
  DEFAULT_ROUTE,
};
