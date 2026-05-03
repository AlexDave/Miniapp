# DogCourse — Telegram Mini App для дрессировки собак

Учебное мини-приложение под Telegram WebApp: персональный маршрут навыков, ежедневный hands-free-урок с собакой, журнал поведения и видео-полка трофеев.

## Что внутри

### Учебный цикл
- **Маршрут** — `Route`/`RouteSkill`, выбирается на онбординге по возрасту и проблеме.
- **Навыки** — 6 категорий × ~18 атомов (`SkillCategory` → `Skill`), у каждого `target_bones` и `atomic_outcome`.
- **Урок** — фазы Зачем → Как → Делаем → Итог. Прогресс гейтится state-машиной `LessonProgress` (`not_started → theory_done → completed`).
- **«Не получилось»** — `fallback_tree` с уровнями L1/L2/L3 + FAQ.

### Геймификация
- **Косточки** — `awardBone()` за уроки, особая косточка каждые 7 дней стрика, 5 стадий по сумме.
- **Полка трофеев** — `UserTrophyVideo` с подписанными URL после каждого урока.
- **Достижения** — авто-выдача через `utils/achievements.js`.

### Удержание
- **Telegram-бот напоминания** — `node-cron` (тик каждые 10 минут с окном ±14 мин), привязка чата через deep-link `t.me/<bot>?start=bind_*`, пер-юзерные TZ и тихие выходные.
- **Журнал поведения** — `BehaviorEvent` + `data/behavior-suggestions.json` для маппинга «инцидент → атом».

### Платежи и Pro
- **Telegram Stars** — `Payment`, `User.tier`/`tier_expires_at`, gating маршрутов через `Route.requires_pro`. Soft-grace 3 дня после expiry.
- Эндпоинт `POST /api/payments/stars-invoice`, webhook `pre_checkout_query` + `successful_payment`.

### Аналитика
- `AnalyticsEvent` пишется через `utils/analytics.js` (мирно дублируется в pino-лог).
- Админ-дашборд: `GET /api/admin/dashboard` (HTML+Chart.js), `funnel`, `cohort` (D1/D7/D30). Авторизация: `X-Admin-Key` или `Authorization: Bearer <ADMIN_API_KEY>`.

### Семейный режим
- `Pet`/`PetMember`/`PetInviteToken` — несколько хозяев → один питомец, общий прогресс.
- Приглашение по `t.me/<bot>?start=pet_*`, активность питомца в Dashboard.

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, Chakra UI, Framer Motion, Zustand, React Query, react-router |
| Backend | Node.js, Express, Prisma ORM 5 (SQLite в dev, PostgreSQL прод-ready), pino |
| Auth | Telegram WebApp `initData` + HMAC-SHA256 (`x-telegram-init-data` header). Dev-режим — фейк-юзер, если `BOT_TOKEN` пуст. |
| Тесты | Vitest + Testing Library (frontend), Jest + Supertest (backend) |
| CI | GitHub Actions: backend syntax + frontend build + Lighthouse CI |

## Быстрый старт

```bash
# 1. Установка зависимостей
npm run install:all

# 2. Backend env
cp backend/.env.example backend/.env
# отредактируйте BOT_TOKEN или используйте DEV_TELEGRAM_ID для локалки

# 3. Миграции и сид
cd backend && npx prisma migrate deploy && npm run db:seed && cd ..

# 4. Запуск backend + frontend
npm run dev
```

После старта frontend на http://localhost:5173 (Vite proxy на `:5000/api`), backend на http://localhost:5000.

## Структура

```
backend/
  prisma/schema.prisma          # 20+ моделей, миграции в prisma/migrations/
  src/routes/                   # 16 роутов: lessons, skills, profile, payments, ...
  src/utils/                    # bones, xp, analytics, telegramSend, reminderTz, ...
  src/jobs/reminderCron.js      # cron-таск напоминаний
  data/atomic-lessons.json      # источник 22+ атомарных уроков
  data/behavior-suggestions.json
frontend/
  src/components/               # lesson/, skills/, routes/, behavior/, profile/, dashboard/
  src/hooks/                    # use{Lessons,SkillTree,Profile,Routes,Behavior,...}
  src/motion/                   # ReducedMotionAnimatePresence + tokens
  src/__tests__/                # Vitest + Testing Library
docs/
  illustration-brief.md         # ТЗ для иллюстраций уроков
PLAN.md                         # Roadmap всех 26 спринтов с чеклистами
```

## Ключевые эндпоинты

- `GET /api/lessons/today` — урок дня (или `null`).
- `GET/POST /api/lessons/:id` — детали + state-машина.
- `POST /api/lessons/:id/theory-seen` `/start-task` `/repeat-start` `/retry-after-fail`.
- `POST /api/lessons/:id/report` — отчёт, в ответе `bones_earned`, `bonesResult`, `fallbackTree` при провале.
- `POST /api/lessons/:id/video` — multipart-аплоад трофей-видео.
- `GET /api/skills/tree`, `GET /api/skills/:key/lessons`.
- `GET /api/routes`, `POST /api/routes/:key/select`.
- `GET/PUT /api/user/profile`, `GET /api/user/profile/bones`, `GET /api/user/profile/reminder-bind-link`.
- `POST /api/behavior/log`, `GET /api/behavior`.
- `POST /api/pets/:id/invite`, `POST /api/pets/join/:token`, `GET /api/pets/mine`, `GET /api/pets/activity`.
- `POST /api/payments/stars-invoice`, webhook `POST /api/telegram/webhook`.
- `GET /api/admin/{dashboard,funnel,cohort}`.

Полный перечень — в `backend/src/routes/`.

## Разработка

```bash
# Backend
cd backend
npm run dev               # nodemon
npm run db:studio         # Prisma Studio
npm run db:reset          # сбросить и пересеять
npm test                  # Jest + Supertest

# Frontend
cd frontend
npm run dev
npm test                  # Vitest
npm run build
npm run lhci              # Lighthouse CI локально
```

## Roadmap

Все спринты живут в [PLAN.md](PLAN.md). Текущий статус: спринты 1–26 закрыты, у нескольких остались технические хвосты (миграции, контент, OpenAPI).

## Лицензия

MIT.
