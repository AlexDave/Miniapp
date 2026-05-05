/**
 * Курсы библиотеки из backend/data/courses.json:
 * карточки и YouTube + полный контент уроков из backend/data/atomic-lessons.json (дни, why, skill_key, теория…).
 */
const fs = require('fs');
const path = require('path');
const atomic = require('../data/atomic-lessons.json');
const {
  lessonFromAtomic,
  enrichLessonWithCatalogVideo,
  defaultSkillTree,
} = require('./seed-content');

const COURSES_JSON = path.join(__dirname, '../data/courses.json');

/** slug в courses.json → course_id в atomic-lessons.json */
const SLUG_TO_ATOMIC_COURSE_ID = {
  puppy: 'puppy_first_month',
  'adult-standard': 'obedience_six_plus',
};

function baseTaskSteps(extra = []) {
  return [...extra];
}

function watchUrlFromLesson(lesson) {
  if (lesson.youtubeId) return `https://www.youtube.com/watch?v=${lesson.youtubeId}`;
  return lesson.video_url || null;
}

function lessonFromYoutubeOnly(lesson) {
  const embed = `https://www.youtube.com/embed/${lesson.youtubeId}`;
  const watchUrl = watchUrlFromLesson(lesson);
  const meta = {
    video_url: watchUrl,
    youtube_id: lesson.youtubeId,
    reflection: true,
    skill_key: 'intro.eye',
    skill: 'focus',
    difficulty: 1,
    progress_gain: 10,
    success_message: 'Отлично! 🎉',
    partial_message: 'Почти получилось 💪',
    fail_message: 'Попробуйте ещё раз в спокойной обстановке.',
  };

  return {
    title: lesson.title,
    description: '',
    theory: watchUrl
      ? `## Видео\n\n[Открыть на YouTube](${watchUrl})\n\nНиже — встроенный плеер.`
      : '## Видео\n\nНиже — встроенный плеер.',
    xp_reward: 10,
    order_index: lesson.lessonNumber,
    meta: JSON.stringify(meta),
    fallback_tree: JSON.stringify({}),
    steps: [
      {
        type: 'card',
        content: lesson.title,
        media_type: 'video',
        media_url: embed,
        alt_text: lesson.title,
      },
    ],
    daily_task: {
      title: lesson.title,
      description: 'Просмотрите урок и коротко отметьте результат.',
      duration_min: 15,
      steps: baseTaskSteps(),
    },
  };
}

/**
 * @param {import('@prisma/client').PrismaClient} prisma
 */
async function seedYoutubeLibraryFromJson(prisma) {
  let raw;
  try {
    raw = fs.readFileSync(COURSES_JSON, 'utf8');
  } catch (e) {
    console.warn('⚠️  courses.json не найден — библиотека YouTube пропущена:', COURSES_JSON);
    return 0;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn('⚠️  courses.json не JSON — пропуск:', e.message);
    return 0;
  }

  const list = data.courses || [];
  if (!Array.isArray(list) || list.length === 0) {
    console.warn('⚠️  courses.json: пустой массив courses');
    return 0;
  }

  await prisma.course.deleteMany({
    where: { content: { contains: 'courses.json' } },
  });

  let totalLessons = 0;

  for (const c of list) {
    const first = c.lessons?.[0];
    const videoUrl = first?.youtubeId ? `https://www.youtube.com/embed/${first.youtubeId}` : null;

    const atomicCourseId = SLUG_TO_ATOMIC_COURSE_ID[c.slug];
    const byDay = new Map();
    if (atomicCourseId) {
      for (const al of atomic.lessons || []) {
        if (al.course_id === atomicCourseId && al.day != null) {
          byDay.set(al.day, al);
        }
      }
    }

    const course = await prisma.course.create({
      data: {
        title: c.title,
        description: c.description ?? '',
        difficulty: c.difficulty ?? 'Начинающий',
        category: c.category ?? 'Общее',
        duration: c.duration ?? '',
        rating: 4.9,
        video_url: videoUrl,
        is_active: true,
        content: JSON.stringify({
          source: 'courses.json',
          slug: c.slug,
          contentFolder: c.contentFolder ?? null,
          atomic_course_id: atomicCourseId ?? null,
          skill_tree: defaultSkillTree,
          defaults: atomic.defaults ?? {},
        }),
      },
    });

    const module = await prisma.module.create({
      data: {
        course_id: course.id,
        title: 'Программа по дням',
        description: atomicCourseId
          ? 'Уроки из atomic-lessons.json + видео из каталога courses.json'
          : 'Уроки из каталога courses.json',
        order_index: 1,
        is_active: true,
      },
    });

    for (const lessonJson of c.lessons || []) {
      let lessonData;
      const al = atomicCourseId ? byDay.get(lessonJson.lessonNumber) : null;

      if (al) {
        lessonData = enrichLessonWithCatalogVideo(lessonFromAtomic(al), lessonJson);
      } else {
        if (atomicCourseId) {
          console.warn(
            `⚠️  Нет atomic-урока для ${c.slug} день ${lessonJson.lessonNumber} — только YouTube`
          );
        }
        lessonData = lessonFromYoutubeOnly(lessonJson);
      }

      const { steps, daily_task, ...lessonFields } = lessonData;

      const lesson = await prisma.lesson.create({
        data: { ...lessonFields, module_id: module.id },
      });
      totalLessons++;

      await prisma.lessonStep.deleteMany({ where: { lesson_id: lesson.id } });
      if (steps?.length) {
        await prisma.lessonStep.createMany({
          data: steps.map((s, i) => ({ ...s, lesson_id: lesson.id, order_index: i })),
        });
      }

      if (daily_task) {
        const { steps: taskSteps, ...taskFields } = daily_task;
        const task = await prisma.dailyTask.create({
          data: { ...taskFields, lesson_id: lesson.id },
        });
        if (taskSteps?.length) {
          await prisma.taskStep.createMany({
            data: taskSteps.map((s, i) => ({ ...s, task_id: task.id, order_index: i })),
          });
        }
      }
    }
  }

  console.log(`✅ Библиотека (courses.json + atomic): курсов ${list.length}, уроков ${totalLessons}`);
  return list.length;
}

module.exports = { seedYoutubeLibraryFromJson, SLUG_TO_ATOMIC_COURSE_ID };
