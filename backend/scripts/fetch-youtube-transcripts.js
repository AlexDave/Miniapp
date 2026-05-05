/**
 * Reads backend/data/courses.json and saves YouTube captions to
 * курс/<contentFolder>/<N> урок/<youtubeId>.txt (UTF-8).
 * Skips existing files unless --force.
 *
 * Uses youtube-transcript (YouTube caption tracks), not the tubetranscript.com UI.
 */
const fs = require('fs/promises');
const path = require('path');
const { YoutubeTranscript } = require('youtube-transcript');

const DELAY_MS = 400;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchSegments(videoId) {
  try {
    return await YoutubeTranscript.fetchTranscript(videoId, { lang: 'ru' });
  } catch {
    return YoutubeTranscript.fetchTranscript(videoId);
  }
}

function bodyFromSegments(segments) {
  return segments.map((s) => s.text).join('\n').trim();
}

async function main() {
  const force = process.argv.includes('--force');
  const repoRoot = path.join(__dirname, '..', '..');
  const coursesPath = path.join(repoRoot, 'backend', 'data', 'courses.json');
  const raw = await fs.readFile(coursesPath, 'utf8');
  const data = JSON.parse(raw);

  const results = { ok: [], skip: [], fail: [] };

  for (const course of data.courses || []) {
    const contentFolder = course.contentFolder;
    if (!contentFolder) {
      console.warn(`Course "${course.slug}" has no contentFolder, skipped`);
      continue;
    }
    const courseTitle = course.title || course.slug;

    for (const lesson of course.lessons || []) {
      const { lessonNumber, title: lessonTitle, youtubeId } = lesson;
      const video_url =
        lesson.video_url ||
        (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : '');
      const dir = path.join(repoRoot, 'курс', contentFolder, `${lessonNumber} урок`);
      const filePath = path.join(dir, `${youtubeId}.txt`);

      try {
        await fs.access(filePath);
        if (!force) {
          results.skip.push({ youtubeId, filePath, reason: 'exists' });
          continue;
        }
      } catch {
        // file missing — proceed
      }

      await fs.mkdir(dir, { recursive: true });

      try {
        const segments = await fetchSegments(youtubeId);
        const body = bodyFromSegments(segments);
        const header = [
          `Курс: ${courseTitle}`,
          `Урок: ${lessonTitle}`,
          `URL: ${video_url}`,
          '',
          '',
        ].join('\n');
        await fs.writeFile(filePath, header + body + '\n', 'utf8');
        results.ok.push(youtubeId);
        console.log('OK', filePath);
      } catch (err) {
        const msg = err && err.message ? err.message : String(err);
        results.fail.push({ youtubeId, lessonTitle, msg });
        console.error('FAIL', youtubeId, msg);
      }

      await sleep(DELAY_MS);
    }
  }

  console.log('\n--- Summary ---');
  console.log('Written:', results.ok.length);
  console.log('Skipped:', results.skip.length);
  console.log('Failed:', results.fail.length);
  if (results.fail.length) {
    console.log(JSON.stringify(results.fail, null, 2));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
