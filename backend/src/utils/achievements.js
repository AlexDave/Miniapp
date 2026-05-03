const { prisma } = require('../database/connection');
const { parseBones } = require('./bones');
const { parsePreferences } = require('./profilePreferences');
const { getPetIdForUser } = require('./petContext');

/** Сколько атомов текущего маршрута имеют хотя бы одну косточку. */
async function countRouteAtomsWithProgress(userId) {
  const profile = await prisma.profile.findUnique({
    where: { user_id: userId },
    select: { preferences: true, pet_id: true },
  });
  if (!profile?.pet_id) return 0;
  const prefs = parsePreferences(profile.preferences);
  const routeKey = prefs.selected_route_key;
  if (!routeKey) return 0;
  const pet = await prisma.pet.findUnique({
    where: { id: profile.pet_id },
    select: { bones_json: true },
  });
  const bones = parseBones(pet?.bones_json);
  const route = await prisma.route.findUnique({
    where: { key: routeKey },
    include: { skills: { include: { skill: { select: { key: true, target_bones: true } } } } },
  });
  if (!route?.skills?.length) return 0;
  let n = 0;
  for (const rs of route.skills) {
    if ((bones[rs.skill_key] ?? 0) >= 1) n++;
  }
  return n;
}

async function checkAndAwardAchievements(userId) {
  const petId = await getPetIdForUser(userId);
  const [pet, allAchievements, earned, reports, doneReports] = await Promise.all([
    prisma.pet.findUnique({ where: { id: petId } }),
    prisma.achievement.findMany({ where: { is_active: true } }),
    prisma.userAchievement.findMany({ where: { user_id: userId } }),
    prisma.dailyReport.findMany({ where: { pet_id: petId }, orderBy: { completed_at: 'asc' } }),
    prisma.dailyReport.findMany({
      where: { pet_id: petId },
      include: { lesson: { select: { module_id: true } } },
    }),
  ]);

  const earnedIds = new Set(earned.map((ua) => ua.achievement_id));
  const newlyEarned = [];

  const routeAtoms = await countRouteAtomsWithProgress(userId);

  let reportsStreak = 0;
  if (reports.length > 0) {
    reportsStreak = 1;
    for (let i = reports.length - 1; i > 0; i--) {
      const curr = new Date(reports[i].completed_at);
      const prev = new Date(reports[i - 1].completed_at);
      const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diff === 1) reportsStreak++;
      else break;
    }
  }

  const completedModules = [...new Set(doneReports.map((r) => r.lesson.module_id))];

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    let condition;
    try {
      condition = JSON.parse(achievement.condition);
    } catch {
      continue;
    }
    let satisfied = false;

    switch (condition.type) {
      case 'routes_completed':
        satisfied = routeAtoms >= condition.value;
        break;
      case 'bones_earned':
        satisfied = (pet?.total_bones ?? 0) >= condition.value;
        break;
      case 'reports_count':
        satisfied = reports.length >= condition.value;
        break;
      case 'streak':
        satisfied = (pet?.streak ?? 0) >= condition.value;
        break;
      case 'reports_streak':
        satisfied = reportsStreak >= condition.value;
        break;
      case 'modules_complete':
        satisfied = completedModules.length >= condition.value;
        break;

      case 'course_completed': {
        const courses = await prisma.course.findMany({
          where: { is_active: true },
          include: {
            modules: {
              include: {
                lessons: { where: { is_active: true }, select: { id: true } },
              },
            },
          },
        });
        let completedCourses = 0;
        for (const c of courses) {
          const ids = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
          if (ids.length === 0) continue;
          const n = await prisma.dailyReport.count({
            where: { pet_id: petId, lesson_id: { in: ids } },
          });
          if (n >= ids.length) completedCourses += 1;
        }
        satisfied = completedCourses >= (condition.value ?? 1);
        break;
      }

      default:
        break;
    }

    if (satisfied) {
      await prisma.userAchievement.create({
        data: { user_id: userId, achievement_id: achievement.id },
      });
      newlyEarned.push({ id: achievement.id, name: achievement.name, icon: achievement.icon, color: achievement.color });
    }
  }

  return newlyEarned;
}

module.exports = { checkAndAwardAchievements };
