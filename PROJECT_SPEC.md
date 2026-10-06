# PROJECT SPEC — DogCourse (спека проекта для быстрого контекста)

> Этот файл — сжатая «спека» проекта: архитектура, договорённости, ключевые файлы и команды.
> Читать вместо повторного анализа репо. Обновлять при крупных изменениях.
> Дата актуализации: 2026-10-07.

## 1. Что это

**DogCourse** — Telegram Mini App (WebApp) для дрессировки собак. Ядро продукта:
персональный **маршрут** навыков → ежедневный **урок** (hands-free flow) → **журнал поведения** →
**видео-полка трофеев**. Геймификация: «косточки» (bones), стрики, достижения. Монетизация: Telegram Stars / Pro-tier.

- Monorepo без workspaces: корень (`package.json` = скрипты-обёртки) + `backend/` + `frontend/` (у каждого свой package.json и node_modules).
- Все тексты UI, комментарии и документация — на **русском**.
- License MIT. Git-репо в `/workspace`.

## 2. Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, Chakra UI v2 (+ немного MUI), Framer Motion, Zustand (persist), React Query v3, react-router-dom v6, axios, lucide-react, react-hot-toast, telegram-web-app |
| Backend | Node.js, Express 4, Prisma ORM 5, SQLite (dev; прод-ready PostgreSQL), pino, multer (видео), node-cron (напоминания) |
| Auth | Telegram WebApp initData + HMAC-SHA256, заголовок `x-telegram-init-data`. Dev-fallback: фейк-юзер если `BOT_TOKEN` пуст и NODE_ENV !== production |
| Тесты | Backend: Jest + Supertest (`backend/src/__tests__`). Frontend: Vitest + Testing Library (`frontend/src/__tests__`) |
| CI | GitHub Actions `.github/workflows/ci.yml`: backend (prisma generate + migrate deploy + node --check), frontend build, Lighthouse CI (mobile) |
| Lint/format | ESLint 9 flat config (`eslint.config.js` в корне), Prettier (`.prettierrc.json`) |

## 3. Команды

Корень:
```bash
npm run install:all   # npm i в root + backend + frontend
npm run dev           # concurrently backend(:5000) + frontend(:5173, ждёт /health)
npm run build         # frontend vite build
npm start             # backend node src/server.js
npm test              # backend jest, затем frontend vitest
npm run lint / format # eslint / prettier
```
Backend (`cd backend`): `npm run dev` (nodemon), `npm test`, `npm run db:seed` (node src/seed.js), `npm run db:studio`, `npm run db:reset`, `npx prisma migrate deploy`.
Frontend (`cd frontend`): `npm run dev`, `npm test`, `npm run build`, `npm run lhci`.

Dev URL: frontend http://localhost:5173 (Vite proxy `/api` и `/health` → :5000), backend http://localhost:5000, health-check `GET /health`.

## 4. Переменные окружения

Backend `.env` (шаблон: `backend/env.example`): `DATABASE_URL`, `PORT=5000`, `HOST`, `NODE_ENV`, `CORS_ORIGIN`, `LOG_LEVEL`,
`BOT_TOKEN`, `DEV_TELEGRAM_ID`, `DEV_USER_NAME`, `TELEGRAM_BOT_USERNAME`, `WEB_APP_URL`, `TELEGRAM_WEBHOOK_SECRET`,
`ADMIN_API_KEY`, `VIDEO_SIGNING_SECRET`, `STARS_PRO_MONTH_AMOUNT`, `PRO_SUBSCRIPTION_DAYS`, `TIER_GRACE_DAYS`, `LESSON_DEMO_VIDEO_URL`.
Frontend `.env`: `VITE_API_URL=http://localhost:5000`, `VITE_APP_NAME`, `VITE_DEBUG`.

Быстрый старт локально без Telegram: пустой BOT_TOKEN + DEV_TELEGRAM_ID → dev-фейк-юзер.

## 5. Структура репозитория

```
backend/
  prisma/schema.prisma        # 31 модель (см. §7), миграции в prisma/migrations/ (12 шт., init..drop_legacy_tracks)
  prisma/dev.db               # SQLite (есть dev.db.working-backup)
  src/app.js                  # сборка express-приложения, порядок middleware/роутов (см. §6)
  src/server.js               # запуск + cron
  src/middleware/             # auth.js (HMAC initData), cors.js, logger.js
  src/routes/                 # 16 роутов (см. §6)
  src/utils/                  # bones, xp, streak, streakLesson, analytics, telegramSend, telegramInvoice,
                              # reminderTz, fallbackTree, tier, achievements, trophyVideoSign, behaviorSuggestions,
                              # lessonMeta, lessonSkillMeta, onboardingRoute, petContext, profileResponse,
                              # profilePreferences, courseTask, validation, logger
  src/jobs/reminderCron.js    # node-cron тик каждые 10 мин, окно ±14 мин, TZ юзера, quiet weekends
  src/database/connection.js  # Prisma Client singleton (также src/lib/prisma.js)
  src/seed.js                 # главный сид: seed-content.js + seedCoursesJson.js + seed-skills.js + data/*.json
  src/seed-content.js         # dual-format: legacy (goal/task_checkboxes/xp) И новый theory_blocks v2
  data/                       # atomic-lessons.json (v2, 35 уроков), lessons-puppy.json (19), lessons-6plus.json (16),
                              # behavior-suggestions.json, courses.json, skill-atomic-outcomes.json
  scripts/                    # assemble-lessons.js (сборка atomic из двух курсов + skill_key map),
                              # fetch-youtube-transcripts.js, parse-tilda-courses.js, reset-user-first-visit.js
  public/                     # admin/ (дашборд HTML+Chart.js), lesson-media/, user-videos/ (multer trophy videos)
frontend/
  vite.config.js              # manualChunks по либам; proxy /api,/health → :5000; vitest jsdom setup
  src/App.jsx                 # роуты (см. §8), lazy-компоненты, QueryClientProvider, OnboardingGate
  src/store/index.js          # Zustand persist: user, userProfile (bones/streak/tier/reminders...), theme
  src/hooks/                  # useApi (axios+initData header), useLessons, useSkillTree, useProfile, useRoutes,
                              # useBehavior, useCourses, useProgress, useAchievements, usePetFamily, useCoachTips
  src/components/             # layout/, lesson/ (LessonView — ядро flow), skills/, routes/, behavior/,
                              # profile/ (TrophyShelf, TrophyVideoShelf), dashboard/, home/, gamification/
                              # (BoneCounter, BoneCelebrate, StreakBadge), progress/, onboarding/, motion/
  src/motion/                 # ReducedMotionAnimatePresence + tokens/variants (доступность prefers-reduced-motion)
  src/constants/              # onboarding.js, skillLabels.js, bottomNav.js
  src/utils/                  # theorySections, lessonSteps, lessonMediaUrl
  src/config/ features.js     # feature flags фронта
курс/                         # исходные материалы курсов: "щенок" (19 уроков) и "от-6-мес-стандарт" (16), папки «N урок»
docs/illustration-brief.md    # ТЗ иллюстраций уроков
PLAN.md                       # roadmap спринтов 1–13 + Фазы A–D, статусы [x]/⚠️
PLATFORM_PLAN.md              # план Daily Skill Loop Platform (модель данных, API, сид, UI)
HANDOFF.md                    # отчёт Content Sprint (35 уроков v2, seed dual-format) — 2026-05-05
QUICK_START.md                # NOTE: устарел местами (пишет про MongoDB/npm run seed — сейчас Prisma/SQLite)
.cursor/skills/               # скилл youtube-transcripts-from-courses-json
```

## 6. Backend: маршруты и API

Порядок в `app.js` (важно): `/` systemRoutes (health) → `/telegram` webhook (без initData) → `/api/admin` (X-Admin-Key или Bearer ADMIN_API_KEY) → `/api/media` (подписанные URL видео, без initData) → **затем `authMiddleware` на весь `/api`** → остальные роуты.

Ключевые эндпоинты:
- Уроки: `GET /api/lessons/today` (или null), `GET/POST /api/lessons/:id`, state-машина `POST /api/lessons/:id/theory-seen | /start-task | /repeat-start | /retry-after-fail`, `POST /api/lessons/:id/report` (в ответе `bones_earned`, `bonesResult`, при провале `fallbackTree` L1/L2/L3), `POST /api/lessons/:id/video` (multipart → UserTrophyVideo).
- Навыки/маршруты: `GET /api/skills/tree`, `GET /api/skills/:key/lessons`, `GET /api/routes`, `POST /api/routes/:key/select`.
- Профиль: `GET/PUT /api/user/profile`, `GET /api/user/profile/bones`, `GET /api/user/profile/reminder-bind-link`.
- Onboarding: `/api/onboarding` (возраст/проблема → подбор Route через utils/onboardingRoute.js).
- Поведение: `POST /api/behavior/log`, `GET /api/behavior` (+ suggestions → маппинг инцидент→атом).
- Семья/pets: `POST /api/pets/:id/invite`, `POST /api/pets/join/:token`, `GET /api/pets/mine`, `GET /api/pets/activity`. Deep-link `t.me/<bot>?start=pet_*`.
- Платежи: `POST /api/payments/stars-invoice`; webhook `POST /api/telegram/webhook` (pre_checkout_query + successful_payment; TELEGRAM_WEBHOOK_SECRET).
- Админ: `GET /api/admin/dashboard` (HTML+Chart.js), `/api/admin/funnel`, `/api/admin/cohort` (D1/D7/D30).
- Прочее: courses, achievements, progress, mediaPublic (signed URL через VIDEO_SIGNING_SECRET).

Аналитика: любой код пишет через `utils/analytics.trackEvent()` → таблица AnalyticsEvent + дубль в pino.

Напоминания: deep-link `t.me/<bot>?start=bind_*` привязывает chat_id; ReminderBindToken; пер-юзерные `reminder_time/reminder_tz/reminder_quiet_weekends`.

## 7. Модель данных (Prisma, 31 модель)

Core: `User` (telegram_id unique, telegram_chat_id, reminders_*, tier free|pro + tier_expires_at), `Profile`, `Pet`/`PetMember`/`PetInviteToken`, `ReminderBindToken`.
Контент: `Course` → `Module` → `Lesson` (meta: why, skip_cost, target_bones, atomic_outcome, requires_pro), `LessonStep`, `DailyTask`/`TaskStep`, `Task`.
Прогресс: `LessonProgress` (not_started → theory_done → completed), `DailyReport`, `UserTrophyVideo`, `CourseProgress`, `UserTask`.
Навыки: `SkillCategory` → `Skill` (атомы), `Route` → `RouteSkill` (requires_pro гейтит маршруты).
Геймификация: `Achievement`/`UserAchievement` (авто-выдача utils/achievements.js), bones считаются `utils/bones.js` (особая косточка за 7-дневный стрик, 5 стадий по сумме).
Прочее: `Payment`, `Notification`/`UserNotification`, `BehaviorEvent`, `ChatMessage`, `AnalyticsEvent`.
Legacy удалён: треки (миграция drop_legacy_tracks), MongoDB больше нет. Enum'ов нет — SQLite, статусы строками.

## 8. Frontend: роуты и UI-конвенции

Роуты (App.jsx): `/` Dashboard, `/skills`, `/library` + `/course/:id`, `/lesson/:lessonId` (LessonView), `/profile/marshrut` (RouteProgressMap), `/chat`, `/profile`, `/onboarding` (вне гейта). Старые `/courses|/train|/tracks|/routes` → redirects. Нижняя навигация: `constants/bottomNav.js` (Home/Skills/Library/Profile).

Урок — линейный flow фаз: **Зачем (WhyScreen + skip_cost блок) → Как (TheoryArticle/TheoryStep) → Делаем (TaskStepFlow/TaskChecklist, hands-free) → Итог (LessonSuccessScreen / LessonFailureOutcome + ReportForm c fallback easy/normal/hard)**.

Конвенции:
- Все запросы через `hooks/useApi.js` (axios instance + заголовок `x-telegram-init-data` из window.Telegram.WebApp); серверное состояние — React Query v3 (import from 'react-query'), клиентское — Zustand persist.
- Анимации только через `motion/ReducedMotionAnimatePresence` + токены (уважать prefers-reduced-motion); кнопки — `PressableButton`.
- Тяжёлые экраны — `React.lazy`.
- Медиа шагов урока: `utils/lessonMediaUrl.js`, ленивая загрузка `LazyStepMedia`, demo-видео из LESSON_DEMO_VIDEO_URL.
- Fallback-формат: seed/UI принимают и старый array, и новый объект `{easy,normal,hard}` (`normalizeFallbackTasksForUI` в LessonView.jsx).

## 9. Контент-пайплайн

Транскрипты YouTube-курсов (папка `курс/`, скрипт `fetch-youtube-transcripts.js`) → `data/lessons-puppy.json` (19) + `data/lessons-6plus.json` (16) → `scripts/assemble-lessons.js` (чинит skill_key по карте из HANDOFF.md, добавляет course_title) → `data/atomic-lessons.json` (version:2) → `src/seed-content.js` (`stepsFromBlocks()`: concept→card, principle→text, tip→tip, warning→tip(⚠️), example→text(📖); `normalizeFallbackTasks()`; `buildTaskCheckboxes()` из success_criteria) → БД.
Итог сида: 2 курса, 35 уроков, 7 категорий/21 атом, 4 маршрута, 10 достижений. Схема урока v2: why, skip_cost, theory_blocks[], how_steps[], common_mistakes[], success_criteria[], fallback_tasks{easy,normal,hard}, pro_tip.
`.cursor/skills/youtube-transcripts-from-courses-json/` — скилл для extraction транскриптов.

## 10. Статус и открытые хвосты

- PLAN.md: спринты 1–13 ✅ (многие ⚠️ = неполно), далее Фазы A–D (сокращение/контент/удержание/продакшн). README говорит «спринты 1–26 закрыты».
- Хвосты: часть миграций/контента/OpenAPI не доделана; QUICK_START.md устарел (MongoDB-секции); в frontend/package.json есть подозрительная self-dependency `"telegram-dogcourse": "file:"` и неиспользуемый react-scripts.
- Тесты backend: tier, behaviorSuggestions, fallbackTree, onboarding, auth, reminderTz. Frontend: Dashboard, HomeHeaderSummary.

## 11. Правила работы с проектом (для агента/разработчика)

1. Не переписывать atomic-lessons.json руками — править source JSON + `assemble-lessons.js` + пересидить.
2. Новые поля модели — через `npx prisma migrate dev` (SQLite), не `db push` в ветке с общими миграциями.
3. Новый API-роут: файл в `src/routes/`, регистрация в `routes/index.js` или `app.js` **до/после** authMiddleware осознанно; ответ в стиле существующих (русские сообщения об ошибках).
4. Аналитику новых действий писать через `trackEvent`, кости — только через `awardBone()`.
5. UI-тексты на русском; компоненты — функциональные, Chakra-стилизация, анимации через motion-обёртки.
6. Перед коммитом: `npm run lint`, `npm test` (обе части), `npm run build`.
