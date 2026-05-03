# DogCourse Miniapp — План улучшений

## Спринт 1: Безопасность и единая БД ✅ (в работе)

### Задачи
- [x] Мигрировать с MongoDB на Prisma/SQLite (убрать двойную БД)
- [x] Реализовать верификацию Telegram initData через HMAC-SHA256
- [x] Обновить все роуты для работы с Prisma Client
- [x] Обновить конфиг, добавить `.env.example`
- [x] Удалить неиспользуемые зависимости (`mongodb`, `node-telegram-bot-api`)

### Что изменилось
- `backend/src/database/connection.js` — заменён на Prisma Client
- `backend/src/middleware/auth.js` — реальная верификация initData (HMAC-SHA256)
- `backend/src/routes/courses.js` — переписан под Prisma
- `backend/src/routes/tracks.js` — переписан под Prisma
- `backend/src/config/index.js` — добавлен `BOT_TOKEN`, убраны MongoDB-поля
- `backend/.env.example` — шаблон переменных окружения

---

## Спринт 2: Данные и State Management ✅

### Задачи
- [x] Добавить `GET/PUT /api/user/profile` эндпоинт на бэкенде
- [x] Добавить seed-данные (`backend/src/seed.js`) — 5 курсов, 3 трека
- [x] Подключить `QueryClientProvider` в `App.jsx`
- [x] Создать хуки `useCourses`, `useTracks`, `useProfile` на React Query
- [x] Обновить `Dashboard.jsx` — реальные данные вместо захардкоженных
- [x] Обновить `Tracks.jsx` — React Query + исправлены имена полей Prisma

### Что изменилось
- `backend/src/routes/profile.js` — GET/PUT профиль
- `backend/src/seed.js` — заполнение БД тестовыми данными
- `frontend/src/hooks/useCourses.js` — React Query хук курсов
- `frontend/src/hooks/useTracks.js` — хуки для треков + мутации
- `frontend/src/hooks/useProfile.js` — хук профиля + синхронизация Zustand
- `frontend/src/App.jsx` — QueryClientProvider обёртка
- `frontend/src/components/Dashboard.jsx` — реальные данные с API
- `frontend/src/components/Tracks.jsx` — React Query + новые имена полей

---

## Спринт 3: Игровая механика ✅

### Задачи
- [x] Таймер треков синхронизируется с сервером (вычисляется из `last_completed_at`)
- [x] Streak: инкремент/сброс при выполнении трека в `tracks.js`
- [x] Seed + GET `/api/user/achievements` — 6 достижений
- [x] `Profile.jsx` подключён к `useProfile` + `useUpdateProfile`
- [x] Достижения в Profile показываются из API (earned/locked)

### Что изменилось
- `backend/src/routes/tracks.js` — функция `updateStreak()` на каждое выполнение
- `backend/src/routes/achievements.js` — новый роут
- `backend/src/seed.js` — 6 достижений добавлено
- `frontend/src/hooks/useAchievements.js` — React Query хук
- `frontend/src/components/Profile.jsx` — реальные данные: профиль, достижения, редактирование имени

---

## Спринт 4a: Daily Skill Loop — уроки и отчёты ✅

### Задачи
- [x] Prisma: модули, уроки, шаги теории, задания дня, отчёты (`DailyReport`)
- [x] Backend: `utils/xp.js` — расчёт XP от отчёта, уровни
- [x] Backend: `utils/achievements.js` — автовыдача достижений
- [x] Backend: `routes/lessons.js` — урок дня, модули, отчёт за урок
- [x] Backend: `routes/progress.js` — карта навыков, активность, статистика
- [x] Seed: контент из `seed-content.js` (курсы «Щенок», «От 6 месяцев»)
- [x] Frontend: `hooks/useLessons.js`, `LessonView`, `TodayLesson`, `Dashboard`

---

## Спринт 4b: Тесты и логирование ✅

### Задачи
- [x] Настроить Vitest + Testing Library для фронтенда
- [x] Настроить Jest + Supertest для бэкенда
- [x] Написать тесты на auth middleware (верификация initData) — 6 unit-тестов
- [x] Написать тесты на tracks API (cooldown, completion, streak) — 11 интеграционных тестов
- [x] Заменить `console.log` на `pino` логгер

### Что изменилось
- `backend/src/utils/logger.js` — pino логгер (pino-pretty в dev, json в prod)
- `backend/jest.config.js` — конфиг Jest с in-file test DB
- `backend/src/__tests__/setup.js` — переменные окружения для тестов
- `backend/src/__tests__/auth.test.js` — 6 unit-тестов HMAC-SHA256 верификации
- `backend/src/__tests__/tracks.test.js` — 11 интеграционных тестов tracks API
- `frontend/vite.config.js` — Vitest (jsdom) + proxy для локальной разработки
- `frontend/src/__tests__/setup.js` — подключение @testing-library/jest-dom
- `frontend/src/__tests__/Dashboard.test.jsx` — 5 тестов компонента Dashboard
- `frontend/src/__tests__/Tracks.test.jsx` — 7 тестов компонента Tracks

---

## Спринт 5: Production-готовность ✅ (2026-05-02)

### Задачи
- [x] Vite proxy для dev-режима (убрать CORS-хак)
- [x] `frontend/.env.example` с `VITE_API_URL`
- [x] Исправлен hook violation (`useColorModeValue` в `toastOptions.style`)
- [x] Все React Query хуки используют единый `apiClient` с auth interceptor
- [x] GitHub Actions CI (`.github/workflows/ci.yml`) — backend syntax + frontend build

### Остаётся
- [ ] Настроить ESLint + Prettier на уровне monorepo
- [ ] Тесты: Vitest (frontend), Jest + Supertest (backend)
- [ ] Документировать API (OpenAPI/Swagger)

---

## Спринт 6: Реальный контент + очистка ✅ (2026-05-03)

### Задачи
- [x] Удалён мусор: `frontend/my-app`, `frontend/build`, `backend/db`, `.claire`, `Tilda_files`, `check-status.js`, `seed.js.local-backup`
- [x] `seed.js` переписан: 6 мини-курсов (35 уроков) + 5 треков из реальных транскриптов
- [x] `backend`: `GET /api/courses/tracks` — каталог всех треков с enrolled-флагом
- [x] `frontend App.jsx`: hook violation пофикшен (Toaster перенесён в AppContent)
- [x] `frontend CourseDetail.jsx`: task.id вместо task.trackId, description вместо content
- [x] `frontend Tracks.jsx`: раздел «Доступные треки» с кнопкой «Начать»
- [x] `frontend config.jsx`: добавлен endpoint tracksCatalog

---

## Спринт 7: Линейный flow урока 🔄

**Цель:** убрать «теорию-в-модалке», сделать урок обязательной последовательностью Зачем→Как→Делаем→Итог с gating-ом.

### Задачи
- [ ] Prisma: таблица `LessonProgress` (`user_id`, `lesson_id`, `state`, `theory_seen_at`, `task_started_at`, `last_repeat_at`, `repeats_count`)
- [ ] Backend: `POST /api/lessons/:id/theory-seen` — отметить теорию пройденной
- [ ] Backend: `POST /api/lessons/:id/start-task` — открыть задание (требует `theory_seen_at`)
- [ ] Backend: `GET /api/lessons/:id` возвращает `state` из `LessonProgress`
- [ ] Frontend: рефакторинг `LessonView.jsx` — фазы `['Зачем', 'Как', 'Делаем', 'Итог']`
- [ ] Frontend: убрать иконку `<Info />` модалки теории, вынести в inline-экраны
- [ ] Frontend: фаза «Зачем» — экран из `lesson.meta.why`
- [ ] Frontend: фаза «Как» — горизонтальная карусель `LessonStep[]`
- [ ] Frontend: фаза «Делаем» — текущий `TaskStepFlow`, ссылка «Перечитать как»
- [ ] Frontend: фаза «Итог» — `ReportForm` + кнопка «Что дальше?»
- [ ] Backend: на завершённом уроке кнопка «Перепройти» возвращает в `theory_done`

### DoD
Открываю урок — нельзя нажать «Получилось» без просмотра теории. На Итоге один чёткий CTA.

---

## Спринт 8: Косточки вместо XP 🔄

**Цель:** UI-замена XP на «Косточки». Поле `xp` в БД остаётся, из UI убирается.

### Задачи
- [ ] Backend: `utils/bones.js` — `awardBones(userId, lessonId, success, isRepeat)`. Правила: 1 за завершение, 1 за повтор через 24ч, особая серия 7 дней
- [ ] Backend: `utils/stages.js` — 5 стадий (Знакомство/Базовые навыки/Уверенный/Самостоятельный/Партнёр)
- [ ] Backend: `GET /api/user/bones` — кол-во по навыкам + особые
- [ ] Backend: `routes/lessons.js` — возвращать `bones_earned` вместо `xp_earned`
- [ ] Frontend: `BoneCounter.jsx` — банка с косточками (замена `LevelBadge`)
- [ ] Frontend: `BoneAnimation.jsx` — «косточка падает в банку» (замена `XPAnimation`)
- [ ] Frontend: `Profile.jsx` — «Стадия: …» вместо «Уровень N»
- [ ] Frontend: `Dashboard.jsx` — убрать XP-виджет, показать копилку текущего навыка
- [ ] Frontend: `LessonView` Итог — анимация косточки в копилку
- [ ] Migration: `bones = floor(xp / 10)` для существующих профилей

### DoD
Слово «XP» не встречается в UI. Завершение урока анимирует косточку, не цифру.

---

## Спринт 9: Атомарное дерево навыков 🔄

**Цель:** расширить 3 плоских навыка до 6 категорий × 18+ атомов.

### Задачи
- [ ] Prisma: `SkillCategory` (`key`, `title`, `description`, `icon`, `order_index`)
- [ ] Prisma: `Skill` (`key`, `category_key`, `title`, `description`, `unlock_rules` JSON, `order_index`)
- [ ] Prisma: `Lesson.skill_key` FK + backfill из `meta.skill`
- [ ] Backend: seed 6 категорий + 18 атомов: Знакомство / Быт / Социализация / Контроль / Прогулка / Границы / Самостоятельность
- [ ] Backend: `GET /api/skills/tree` — категории + атомы + прогресс пользователя
- [ ] Backend: `GET /api/skills/:key/lessons` — уроки атома
- [ ] Backend: `utils/skillProgress.js` — прогресс атома = косточки / целевое число
- [ ] Frontend: рефакторинг `SkillsScreen.jsx` — `CategoryGrid` → `CategoryDetail` → список атомов
- [ ] Frontend: `useSkillTree` хук
- [ ] Frontend: главная — мини-копилка только текущего атома

### DoD
«Навыки»: 6 крупных карточек → клик → 2-4 атома → уроки. Заблокированные кликабельны с предупреждением «рекомендуем сначала…».

---

## Спринт 10: Иллюстрации + многоразовость 🔄

**Цель:** функциональные иллюстрации в шагах теории, полная многоразовость уроков.

### Задачи
- [ ] Prisma: `LessonStep.image_url`, `LessonStep.image_role` (pose/movement/antipattern/trigger/time), `LessonStep.alt_text`
- [ ] Backend: `backend/public/lesson-images/` — папка для статики + express.static
- [ ] Контент: ТЗ для иллюстратора в `docs/illustration-brief.md`
- [ ] Frontend: `TheoryStep.jsx` — рендер `<img loading="lazy">` с alt, max-width
- [ ] Backend: `GET /api/lessons/:id/history` — история повторов
- [ ] Backend: `POST /api/lessons/:id/repeat-start` — запуск повтора (возврат в `theory_done`)
- [ ] Backend: `awardBones` с флагом `isRepeat`, валидация 24ч
- [ ] Frontend: кнопка «Перепройти» на завершённом уроке
- [ ] Frontend: `LessonView` Итог — при повторе без 24ч: «косточка прибавится завтра»
- [ ] Frontend: в `SkillsScreen` на каждом уроке показывать `repeats_count`

### DoD
5 пилотных уроков с иллюстрациями. Любой завершённый урок можно перепройти, награда только через 24ч.

---

## Спринт 11: Маршруты вместо Треков 🔄

**Цель:** «Треки» → «Персональный маршрут», собираемый на онбординге.

### Задачи
- [ ] Prisma: `Route` (`key`, `title`, `description`, `goal_key`, `duration_days`, `icon`)
- [ ] Prisma: `RouteSkill` (`route_id`, `skill_key`, `order_index`)
- [ ] Prisma: `User.active_route_id` (nullable FK)
- [ ] Backend: seed 4 маршрута (Первая неделя / Спокойная прогулка / Безопасный отзыв / Спокойствие дома)
- [ ] Backend: `GET /api/routes`, `POST /api/routes/:key/start`, `GET /api/routes/active`
- [ ] Backend: `POST /api/routes/pause`, `resume`, `swap`
- [ ] Frontend: `OnboardingWizard.jsx` — финальный шаг выбора маршрута
- [ ] Frontend: `RouteCard.jsx` — главная карточка маршрута (70% экрана)
- [ ] Frontend: `RouteMap.jsx` — карта прогресса N/14
- [ ] Frontend: убрать `Tracks` из нав-бара, нав-бар → Сегодня/Навыки/Библиотека/Я
- [ ] Frontend: «Курсы» переименовать в «Библиотека»

### DoD
Новый пользователь после онбординга видит маршрут. «Треков» в нав-баре нет.

---

## Спринт 12: Атомарный контент из транскриптов 🔄

**Цель:** заменить gpt-синтетику на 22 урока из реальных транскриптов.

### Задачи
- [ ] `data/atomic-lessons.json` — 22 атома по карте контент-плана из аудита
- [ ] Каждый атом: `meta.why`, 3 шага «Как», 3-5 чек-боксов, `fallback_tasks`, `skill_key`, `video_url`
- [ ] `seed-content.js` переписан под `atomic-lessons.json`
- [ ] Mapping `meta.skill → skill_key` для существующих `LessonProgress`
- [ ] Удалить `gpt_coures.json` после миграции

### DoD
В БД 22 атомарных урока с реальными источниками. `gpt_coures.json` удалён.

---

## Спринт 13: Финальный лоск 🔄

**Цель:** анимации, полка трофеев, аналитика воронки, доступность.

### Задачи
- [ ] Frontend: анимация падения косточки с физикой (Framer Motion spring)
- [ ] Frontend: «Полка трофеев» в `Profile.jsx`
- [ ] Frontend: пустые состояния с CTA на каждом экране
- [ ] Frontend: «Не получилось» → дружественный экран + `fallback_tasks`
- [ ] Backend: события аналитики `lesson.theory_seen`, `lesson.completed`, `lesson.repeated`, `route.started`, `bone.awarded`
- [ ] Backend: `GET /api/admin/funnel` — онбординг → 1 урок → 7 дней
- [ ] Доступность: контраст, кнопки 44px+, `prefers-reduced-motion`
- [ ] Frontend: code splitting по маршрутам
- [ ] Обновить `README.md`

---

## Технический стек

| Слой | Технология |
|------|-----------|
| Frontend | React 18, Vite, Chakra UI, Zustand, React Query |
| Backend | Express.js, Prisma ORM, SQLite (dev) / PostgreSQL (prod) |
| Auth | Telegram WebApp initData + HMAC-SHA256 |
| Тесты | Vitest (frontend), Jest + Supertest (backend) |
