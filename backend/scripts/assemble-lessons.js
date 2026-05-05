/**
 * assemble-lessons.js
 *
 * Читает lessons-puppy.json и lessons-6plus.json, исправляет skill_key,
 * добавляет course_title и собирает итоговый atomic-lessons.json.
 *
 * Запуск: node backend/scripts/assemble-lessons.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// ── Корректные skill_key по (course_id, day) ─────────────────────────────────
// Основано на реальных темах уроков из transcripts

const SKILL_KEY_MAP = {
  puppy_first_month: {
    1:  'intro.name',     // "Кто такой щенок?" — первый контакт, имя
    2:  'daily.sleep',    // "Что нужно купить" — место для сна, домик
    3:  'daily.sleep',    // "Как подготовить квартиру" — обустройство пространства
    4:  'daily.toilet',   // "Приучаем щенка ходить в туалет на пеленку"
    5:  'daily.toilet',   // "Приучаем щенка ходить в туалет на улице"
    6:  'bound.no',       // "Поощрения/наказания. Границы и правила дома"
    7:  'daily.groom',    // "Правила здоровья и профилактика болезней"
    8:  'daily.groom',    // "Уход за собакой (купание, чистка ушей, глаз, стрижка когтей)"
    9:  'bound.no',       // "Команды «Фу» и «Нельзя»"
    10: 'intro.eye',      // "Кто такой кинолог?" — контакт с профессионалом, наблюдение
    11: 'bound.bark',     // "Как избавиться от лая собаки"
    12: 'self.alone',     // "Вольеры, клетки, переноски" — crate training = одиночество
    13: 'daily.sleep',    // "Собака мешает спать" — режим сна
    14: 'social.sounds',  // "Первая прогулка с собакой" — социализация на улице
    15: 'control.sit',    // "Учим команды сидеть и лежать"
    16: 'intro.name',     // "Учим щенка отзываться на кличку"
    17: 'bound.bite',     // "Отучаем щенка кусать руки и ноги"
    18: 'social.people',  // "Развитие щенка" — социализация, взаимодействие
    19: 'self.tired',     // "Как утомить щенка"
  },
  obedience_six_plus: {
    1:  'intro.name',     // "Зачем учить команды с собакой?" — мотивация, контакт
    2:  'self.tired',     // "Как утомить собаку?"
    3:  'control.sit',    // "Учим команду сидеть"
    4:  'control.down',   // "Учим команду лежать"
    5:  'intro.eye',      // "Ведение за рукой" — внимание к руке = зрительный контакт
    6:  'walk.recall',    // "Учим команду Ко мне"
    7:  'walk.heel',      // "Учим команду рядом"
    8:  'control.wait',   // "Учим команду Ждать"
    9:  'bound.no',       // "Учим команду ФУ"
    10: 'control.place',  // "Учим команду Место"
    11: 'intro.eye',      // "Учим команду Глазки"
    12: 'walk.recall2',   // "Улучшаем подзыв"
    13: 'walk.loose',     // "Отучаем тянуть"
    14: 'self.alone',     // "Приучаем к одиночеству"
    15: 'walk.drop',      // "Отучаем подбирать с земли"
    16: 'bound.bark',     // "Отучаем собаку лаять"
  },
};

// ── Правильные заголовки уроков из courses.json ──────────────────────────────

const LESSON_TITLES = {
  puppy_first_month: {
    1:  'Кто такой щенок?',
    2:  'Что нужно купить к приезду щенка?',
    3:  'Как подготовить квартиру к приезду щенка?',
    4:  'Приучаем щенка ходить в туалет на пеленку',
    5:  'Приучаем щенка ходить в туалет на улице',
    6:  'Поощрения и наказания. Границы и правила дома',
    7:  'Правила здоровья и профилактика болезней',
    8:  'Уход за собакой',
    9:  'Команды «Фу» и «Нельзя»',
    10: 'Кто такой кинолог?',
    11: 'Как избавиться от лая собаки',
    12: 'Вольеры, клетки, переноски',
    13: 'Собака мешает спать',
    14: 'Первая прогулка с собакой',
    15: 'Учим команды сидеть и лежать',
    16: 'Учим щенка отзываться на кличку',
    17: 'Отучаем щенка кусать руки и ноги',
    18: 'Развитие щенка',
    19: 'Как утомить щенка',
  },
  obedience_six_plus: {
    1:  'Зачем учить команды с собакой?',
    2:  'Как утомить собаку?',
    3:  'Учим команду «Сидеть»',
    4:  'Учим команду «Лежать»',
    5:  'Ведение за рукой',
    6:  'Учим команду «Ко мне»',
    7:  'Учим команду «Рядом»',
    8:  'Учим команду «Ждать»',
    9:  'Учим команду «Фу»',
    10: 'Учим команду «Место»',
    11: 'Учим команду «Глазки»',
    12: 'Улучшаем подзыв',
    13: 'Отучаем тянуть',
    14: 'Приучаем к одиночеству',
    15: 'Отучаем подбирать с земли',
    16: 'Отучаем собаку лаять',
  },
};

const COURSE_META = {
  puppy_first_month: {
    id: 'puppy_first_month',
    title: 'Щенок: первый месяц',
    description: 'Первый месяц с щенком: туалет, режим, социализация и базовые команды',
    duration_days: 19,
    difficulty: 'easy',
  },
  obedience_six_plus: {
    id: 'obedience_six_plus',
    title: 'Послушание: от 6 месяцев',
    description: 'Команды, ведение, подзыв и работа с типичными проблемами поведения',
    duration_days: 16,
    difficulty: 'easy',
  },
};

function fixLesson(lesson, courseId) {
  const day = lesson.day;
  const correctSkillKey = (SKILL_KEY_MAP[courseId] || {})[day] || lesson.skill_key;
  const correctTitle    = (LESSON_TITLES[courseId] || {})[day] || lesson.title;
  const courseMeta      = COURSE_META[courseId];

  return {
    ...lesson,
    course_id:    courseId,
    course_title: courseMeta?.title || courseId,
    day,
    title:        correctTitle,
    skill_key:    correctSkillKey,
  };
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Файл не найден: ${filePath}`);
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`❌ Ошибка парсинга ${filePath}:`, e.message);
    return null;
  }
}

function main() {
  const puppyPath  = path.join(DATA_DIR, 'lessons-puppy.json');
  const sixPlusPath = path.join(DATA_DIR, 'lessons-6plus.json');

  const puppyLessons  = loadJson(puppyPath);
  const sixPlusLessons = loadJson(sixPlusPath);

  if (!puppyLessons || !sixPlusLessons) {
    console.error('❌ Один или оба файла с уроками не найдены. Дождитесь завершения агентов.');
    process.exit(1);
  }

  const puppy = Array.isArray(puppyLessons)   ? puppyLessons   : puppyLessons.lessons   || [];
  const sixPlus = Array.isArray(sixPlusLessons) ? sixPlusLessons : sixPlusLessons.lessons || [];

  console.log(`📚 Щенок: ${puppy.length} уроков`);
  console.log(`📚 От 6 мес: ${sixPlus.length} уроков`);

  const fixedPuppy   = puppy.map((l)   => fixLesson(l, 'puppy_first_month'));
  const fixedSixPlus = sixPlus.map((l) => fixLesson(l, 'obedience_six_plus'));

  const allLessons = [...fixedPuppy, ...fixedSixPlus];

  const output = {
    version: 2,
    generatedAt: new Date().toISOString(),
    source: 'youtube_transcripts',
    defaults: {
      user: {
        xp: 0,
        level: 1,
        streak: 0,
        coins: 0,
        skills: { focus: 0, recall: 0, sit: 0 },
      },
    },
    courses: Object.values(COURSE_META),
    lessons: allLessons,
  };

  const outPath = path.join(DATA_DIR, 'atomic-lessons.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n✅ Записано в ${outPath}`);
  console.log(`   Всего уроков: ${allLessons.length}`);
  console.log(`   Курсов: ${output.courses.length}`);

  // Проверка skill_key
  const unknownSkills = new Set();
  for (const l of allLessons) {
    if (!l.skill_key) unknownSkills.add(`${l.course_id}:${l.day}`);
  }
  if (unknownSkills.size > 0) {
    console.warn('⚠️  Уроки без skill_key:', [...unknownSkills].join(', '));
  } else {
    console.log('   Все skill_key заполнены ✓');
  }
}

main();
