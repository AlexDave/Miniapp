/**
 * Извлекает из сохранённых HTML Tilda список уроков (заголовок + YouTube ID).
 * Запуск из корня backend: node scripts/parse-tilda-courses.js
 * Или из корня репозитория: node backend/scripts/parse-tilda-courses.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const OUT = path.join(__dirname, '../data/courses.json');

const SOURCES = [
  {
    slug: 'puppy',
    htmlPath: path.join(ROOT, 'курс/Tilda_ Личный кабинет.html'),
    courseTitle: 'Онлайн-курс: щенок',
    courseDescription:
      'Подготовка к щенку, быт, туалет, здоровье, базовые команды и социализация (из материалов личного кабинета).',
    category: 'Щенок',
    durationLabel: '19 уроков',
  },
  {
    slug: 'adult-standard',
    htmlPath: path.join(
      ROOT,
      'курс/Tilda_ Личный кабинет от 6 месяцев и старше (Стандарт).html',
    ),
    courseTitle: 'Курс для собак от 6 месяцев (Стандарт)',
    courseDescription:
      'Команды, ведение, подзыв, работа с типичными проблемами поведения.',
    category: 'От 6 месяцев',
    durationLabel: '16 уроков',
  },
];

function splitRecords(html) {
  // Без \b после кавычки: иначе нет границы между " и пробелом
  const re = /<div class="record"/g;
  const indices = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    indices.push(m.index);
  }
  indices.push(html.length);
  const blocks = [];
  for (let i = 0; i < indices.length - 1; i += 1) {
    blocks.push(html.slice(indices[i], indices[i + 1]));
  }
  return blocks;
}

/** YouTube video id из блока t-video-lazyload */
function youtubeIdFromRecord(record) {
  const openTags = record.matchAll(/<div class="t-video-lazyload"[^>]*>/g);
  for (const om of openTags) {
    const tag = om[0];
    if (!tag.includes('youtube')) continue;
    const idM = /data-videolazy-id="([^"]+)"/.exec(tag);
    if (idM) return idM[1];
  }
  return null;
}

/** Текст заголовка урока без HTML-тегов */
function lessonTitleFromRecord(record) {
  const m = record.match(
    /Урок\s+(\d+)\.\s*((?:[^<]|<br\s*\/?\s*>)+?)(?=\s*<\/div>|\s*<\/span>)/i,
  );
  if (!m) return null;
  const num = m[1];
  let rest = m[2].replace(/<br\s*\/?\s*>/gi, ' ').replace(/\s+/g, ' ').trim();
  return { num: parseInt(num, 10), title: `Урок ${num}. ${rest}` };
}

function parseHtmlFile(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const lessons = [];
  for (const block of splitRecords(html)) {
    const yt = youtubeIdFromRecord(block);
    const lesson = lessonTitleFromRecord(block);
    if (lesson && yt) {
      lessons.push({
        lessonNumber: lesson.num,
        title: lesson.title,
        youtubeId: yt,
        video_url: `https://www.youtube.com/watch?v=${yt}`,
      });
    }
  }
  lessons.sort((a, b) => a.lessonNumber - b.lessonNumber);
  return lessons;
}

function main() {
  const courses = [];
  for (const src of SOURCES) {
    if (!fs.existsSync(src.htmlPath)) {
      console.warn('Пропуск (файл не найден):', src.htmlPath);
      continue;
    }
    const lessons = parseHtmlFile(src.htmlPath);
    courses.push({
      slug: src.slug,
      title: src.courseTitle,
      description: src.courseDescription,
      category: src.category,
      duration: src.durationLabel,
      difficulty: 'Начинающий',
      lessons,
    });
    console.log(`${src.slug}: извлечено уроков — ${lessons.length}`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), courses }, null, 2)}\n`, 'utf8');
  console.log('Записано:', OUT);
}

main();
