-- Спринт 11/15: треки заменены на маршруты (Route/RouteSkill).
-- Удаляем устаревшие таблицы tracks и user_tracks, фронт их не вызывает,
-- API /api/courses/tracks и сид удалены.

PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS "user_tracks";
DROP TABLE IF EXISTS "tracks";

PRAGMA foreign_keys=ON;
