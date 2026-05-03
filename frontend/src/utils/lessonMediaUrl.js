import config from '../config';

/**
 * Абсолютный URL для медиа шага: внешние https — как есть;
 * пути `/lesson-media/...` — относительно `VITE_API_URL` (тот же хост, что и API).
 */
export function resolveLessonMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (/^https?:\/\//i.test(url)) return url;
  const base = (config.baseUrl || '').replace(/\/$/, '');
  if (!base) return url;
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
