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

# Доп. бэклог по итогам UX-аудита (2026-05-03)

Аудит показал три класса проблем:
1. **Концептуальный шум** — Курсы/Библиотека/Треки/Маршруты/Навыки/Категории/Атомы/Уроки/Косточки/XP — слишком много сущностей в UI.
2. **Дублирование** — `Dashboard.TodayLesson` и `TrainScreen` показывают одно и то же.
3. **Контентная пустота** — нет видео/иллюстраций, «Не получилось» обрывается, уроки не работают hands-free с собакой.

Спринты ниже — продолжение бэклога после 7-13. Группировка по фазам: **A** сокращение, **B** контент, **C** удержание, **D** продакшн.

---

## Фаза A — Сокращение и фокус

### Спринт 14: Онбординг 5→2 шага 🔄

**Цель:** довести юзера до первого урока за минимум кликов; убрать рассинхрон с бэком.

#### Задачи
- [ ] `OnboardingWizard.jsx`: оставить только 2 шага — кличка + возрастная корзина
- [ ] Удалить hardcoded `ROUTE_OPTIONS` из вьюверда — маршрут назначается на бэке по `dog_age_bucket`
- [ ] Backend: `POST /api/onboarding/complete` — возвращает назначенный `route_key` + первый `lesson_id`
- [ ] Шаги «цели» и «главная проблема» — спросить ВНУТРИ первого урока (`Зачем` фаза) или после 3-го дня
- [ ] После онбординга: редирект СРАЗУ на `/lesson/:firstId` (а не на `/onboarding/recommendations`)
- [ ] Удалить экран `OnboardingRecommendations.jsx` (рекомендации курсов = старая концепция)
- [ ] `OnboardingGate`: не редиректить если `selected_route_key` уже есть (даже без `onboarding_completed`)

#### DoD
Новый юзер от старта до фразы «Зачем тренировать "Сидеть"» — не больше 3 экранов.

---

### Спринт 15: Консолидация навигации 🔄

**Цель:** 3 таба вместо 5; убрать дубли «Сегодня/Тренировка»; ампутировать Tracks.

#### Задачи
- [ ] `BottomNavigation`: оставить **Сегодня · Навыки · Я**
- [ ] Удалить `TrainScreen.jsx` — слить логику в Dashboard как hero-блок
- [ ] Маршрут как карточка прогресса наверху Dashboard (RouteCard 70% экрана), а не отдельный таб
- [ ] Удалить из роутинга: `/train`, `/tracks`, `/routes` (последний — внутрь профиля как «Сменить маршрут»)
- [ ] Удалить `Tracks.jsx`, `TrackCard.jsx`, `useTracks.js`, `routes/tracks.js` (бэк)
- [ ] `Courses.jsx` → переименовать в `Library.jsx`, спрятать в Profile или вторичный экран
- [ ] Migration: данные из `Track`/`UserTrack` мигрировать в `Route`/`UserRoute` (или drop, если пустые в проде)

#### DoD
В nav 3 пункта. Слово «трек» не встречается в UI и в коде frontend.

---

### Спринт 16: Чистка моков и мёртвых ссылок 🔄

**Цель:** убрать всё, что притворяется работающим.

#### Задачи
- [ ] `Profile.jsx`: удалить hardcoded `[focus, sit, recall]` (строки 240-243) — заменить на текущий маршрут + 3 атома с самым высоким прогрессом
- [ ] `Profile.jsx`: премиум-баннер скрыть за `feature_flag.payments` (default off) или удалить
- [ ] `Profile.jsx` Settings/Поддержка: убрать кнопки «Настроить»/«Открыть», которые ничего не делают, ИЛИ реализовать минимум
- [ ] `seed.js` достижения: переписать `tracks_completed` → `routes_completed`, `perfect_reports` → `bones_earned`
- [ ] Удалить `xp` из всех frontend-компонентов (PLAN сп.8 не закрыт): `LevelBadge`, `XPAnimation`, `gamification/`
- [ ] Скрыть `Notifications.jsx` пока пустой, или убрать иконку колокольчика из header

#### DoD
Каждая видимая кнопка либо работает, либо невидима. `grep -r "XP\|Track\|focus.*sit.*recall"` пуст.

---

## Фаза B — Контент: то, без чего продукт пустой

### Спринт 17: Hands-free режим урока 🔄

**Цель:** во время «Делаем» телефон лежит, я работаю с собакой.

#### Задачи
- [ ] `TaskStepFlow.jsx`: режим «таймер» — 60-90 сек на шаг, авто-переход
- [ ] Web Speech API: озвучивание шага голосом перед таймером (русский TTS)
- [ ] Одна большая кнопка «Готово» / свайп вниз «Не получилось» (без выбора многих опций)
- [ ] Auto-wake-lock на странице урока (Screen Wake Lock API) — экран не гаснет
- [ ] Vibration API на завершении шага (если поддерживается Telegram WebApp)
- [ ] Настройка в профиле: «Тихий режим» (без TTS/без вибро)
- [ ] Telegram WebApp `disableVerticalSwipes()` на странице урока

#### DoD
Можно пройти урок ни разу не глядя в экран после старта. Экран не гаснет 5 минут.

---

### Спринт 18: «Не получилось» с глубиной 🔄

**Цель:** провал — не тупик, а развилка.

#### Задачи
- [ ] Schema: `Lesson.fallback_tree` — JSON с уровнями упрощения (3 уровня)
- [ ] `seed-content.js`: для каждого из 22 атомов прописать L1/L2/L3 упрощения
- [ ] `LessonView` экран `bonesResult.outcome === 'no'`: показать L1, кнопки «Попробовать снова» / «Ещё проще»
- [ ] Backend: трекать `attempts_at_level` в `LessonProgress`
- [ ] Если 3 раза провал на L3 — кнопка «Спросить у тренера» (текстовый шаблонный ответ или ссылка на чат)
- [ ] FAQ-блок «Частые проблемы» внизу экрана (3-5 ссылок на смежные атомы: туалет/лай/возбуждение)

#### DoD
После «Не получилось» юзер всегда имеет 1 содержательный следующий шаг, не «К тренировке».

---

### Спринт 19: Демонстрационные иллюстрации (расширение сп.10) 🔄

**Цель:** покрыть 22 атома GIF/видео-демо, не статикой.

#### Задачи
- [ ] Доуточнить `docs/illustration-brief.md`: GIF 3-5 сек, 480p, ≤500 KB, без звука
- [ ] `LessonStep.media_type` (`image|gif|video`), `LessonStep.media_url`, `LessonStep.poster_url`
- [ ] Backend: `/public/lesson-media/` + CDN-готовая раздача (Cache-Control)
- [ ] `TheoryStep.jsx`: рендер `<video autoplay loop muted playsinline>` для GIF/MP4
- [ ] Контент: 22 атома × ~3 шага = ~66 GIF (отрисовка/съёмка с реальным щенком)
- [ ] Lazy-loading + IntersectionObserver, чтобы не качать всё сразу
- [ ] Fallback на статичную картинку если медиа не загрузилось

#### DoD
В каждом из 22 атомов хотя бы 1 шаг с видео-демонстрацией.

---

## Фаза C — Удержание и связь с реальностью

### Спринт 20: Telegram-бот напоминания 🔄

**Цель:** нативный канал для возврата без push-инфраструктуры.

#### Задачи
- [ ] Backend: cron-job runner (`node-cron` или внешний trigger) — каждый час
- [ ] Schema: `User.reminder_time` (HH:MM в TZ), `User.tz`, `User.reminders_enabled`
- [ ] Bot endpoint: при `/start` запрос на привязку `chat_id` к user
- [ ] Job: для users с `reminders_enabled` и `reminder_time` ≈ now — отправить сообщение «🐾 {petName} ждёт 5 минут практики» + deeplink на mini-app
- [ ] Skip если урок уже сделан сегодня
- [ ] Профиль: настройка времени + переключатель + «не беспокоить в выходные»
- [ ] Анти-спам: не больше 1 напоминания в день

#### DoD
Юзер с `reminder_time=19:00` получает 1 сообщение в 19:00 в дни, когда не тренировался.

---

### Спринт 21: Журнал поведения 🔄

**Цель:** связать реальные проблемы с уроками.

#### Задачи
- [ ] Schema: `BehaviorEvent` (`user_id`, `type`, `note`, `severity`, `created_at`). Типы: `barking`, `accident`, `escape`, `aggression`, `chewing`, `other`
- [ ] Backend: `POST /api/behavior/log`, `GET /api/behavior` (последние 30 дней)
- [ ] Frontend: на Dashboard кнопка «Отметить инцидент» → bottom sheet с типами
- [ ] Mapping `BehaviorEvent.type → suggested_skill_key` в `data/behavior-suggestions.json`
- [ ] После лога: предложить релевантный атом «У вас 3 случая лая за неделю — попробуйте навык "Контроль лая"»
- [ ] В профиле: timeline инцидентов + статистика «лай ↓ на 40% за 2 недели»

#### DoD
Каждый залогированный инцидент имеет 1 рекомендуемый атом для тренировки.

---

### Спринт 22: Эмоциональная награда и видео-полка 🔄

**Цель:** косточка = конкретный микро-навык, а не абстрактное число.

#### Задачи
- [ ] `Skill.atomic_outcome` — текстовое описание «садится по голосу с расстояния 1 м»
- [ ] `LessonView` Итог: вместо «+1 косточка» — «{petName} теперь умеет: {atomic_outcome} ({n}/{target})»
- [ ] Backend: `POST /api/lessons/:id/video` (multipart, max 10 MB, 5 сек, MP4) — опционально на Итоге
- [ ] Storage: локально `/public/user-videos/` (потом → S3-совместимое хранилище)
- [ ] Frontend: `<input type="file" accept="video/*" capture>` на экране Итога
- [ ] `Profile.jsx`: «Полка трофеев» — grid превью видео с подписью «{atomic_outcome} · {date}»
- [ ] Privacy: видео только для владельца, не публикуются

#### DoD
На Полке трофеев минимум 1 видео после 3 завершённых уроков с записью.

---

## Фаза D — Готовность к продакшну

### Спринт 23: Платежи Telegram Stars 🔄

**Цель:** заменить мок-баннер на работающую покупку.

#### Задачи
- [ ] Решить модель: подписка vs одноразовая разблокировка маршрута vs free-форевер
- [ ] Schema: `User.tier` (`free|pro`), `User.tier_expires_at`, `Payment` лог
- [ ] Backend: `POST /api/payments/invoice` — создать invoice через Telegram Bot API (XTR)
- [ ] Webhook `successful_payment` → апдейт `User.tier`
- [ ] Frontend: `Profile.jsx` баннер «Купить» → реальный `Telegram.WebApp.openInvoice()`
- [ ] Gating: маршруты «Calm at home», «Recall» — только для `tier=pro`
- [ ] Refund-эндпоинт + soft-grace 3 дня после expiry

#### DoD
Реальная транзакция Stars проходит, `tier` меняется, премиум-маршрут разблокируется.

---

### Спринт 24: Аналитика воронки (расширение сп.13) 🔄

**Цель:** мерить, иначе нельзя итерировать.

#### Задачи
- [ ] Backend: `AnalyticsEvent` table (`user_id`, `event`, `props` JSON, `ts`)
- [ ] События: `onboarding.start`, `onboarding.complete`, `lesson.opened`, `lesson.theory_seen`, `lesson.task_started`, `lesson.completed`, `lesson.failed`, `lesson.repeated`, `route.started`, `route.completed`, `bone.awarded`, `reminder.sent`, `reminder.opened`, `behavior.logged`, `payment.invoice_created`, `payment.success`
- [ ] `GET /api/admin/funnel?from=&to=` — агрегаты воронки по дням
- [ ] `GET /api/admin/cohort?week=` — retention по неделям
- [ ] Простая HTML-админка `/admin/dashboard` с базовыми графиками (Chart.js)
- [ ] Auth: bearer token из `.env`, не Telegram

#### DoD
В админке видно: % онбординг→1-й урок, D1/D7/D30 retention, lesson success rate.

---

### Спринт 25: Доступность и performance 🔄

**Цель:** соответствие WCAG AA + быстрый старт mini-app.

#### Задачи
- [ ] Контраст текста ≥ 4.5:1 (особенно `gray.500` на `gray.50`)
- [ ] Все интерактивные элементы ≥ 44×44 px
- [ ] `prefers-reduced-motion`: отключать AnimatePresence, оставлять fade
- [ ] `aria-live` для динамических награждений (косточка/стадия)
- [ ] Code splitting: `React.lazy` для `Profile`, `SkillsScreen`, `Library`, `LessonView`
- [ ] Initial bundle ≤ 200 KB gzipped (сейчас замерить и оптимизировать)
- [ ] Preload `useTodayLesson` в `index.html` через `<link rel="preload">`
- [ ] Lighthouse CI в GitHub Actions: блокировать PR с regression > 5 пунктов

#### DoD
Lighthouse Mobile ≥ 90 по Performance/Accessibility/Best Practices.

---

### Спринт 26 (опц.): Семейный режим 🔄

**Цель:** один питомец, несколько хозяев — общий прогресс.

#### Задачи
- [ ] Schema: `Pet` (отделить от `User`), `PetMember` (`pet_id`, `user_id`, `role`)
- [ ] Migration: 1 user → 1 pet (default), позже invite по ссылке
- [ ] Backend: `POST /api/pets/:id/invite` → одноразовый токен в Telegram-сообщении
- [ ] Backend: `POST /api/pets/join/:token` → присоединение
- [ ] Frontend: на Dashboard показывать «Аня сделала утренний урок 2 ч назад»
- [ ] Профиль: «Хозяева Барбоса» список + «Пригласить»
- [ ] Косточки и стадия — общие на питомца, не на юзера

#### DoD
2 telegram-аккаунта тренируют 1 виртуального щенка, прогресс синхронизирован.

---

## Приоритетная последовательность

```
A: 14 → 15 → 16          (≈2 недели — фундамент UX)
B: 17 → 18 → 19          (≈3 недели — контент-минимум для беты)
C: 20 → 21 → 22          (≈3 недели — удержание)
D: 23 → 24 → 25 → [26]   (≈3 недели — продакшн)
```

**MVP-релиз:** A + B + 20 (напоминания) = 6 недель работы.
**Public beta:** A + B + C + 24 (аналитика).
**Launch:** всё включая 23 (платежи) и 25 (a11y).

---

## Технический стек

| Слой | Технология |
|------|-----------|
| Frontend | React 18, Vite, Chakra UI, Zustand, React Query |
| Backend | Express.js, Prisma ORM, SQLite (dev) / PostgreSQL (prod) |
| Auth | Telegram WebApp initData + HMAC-SHA256 |
| Тесты | Vitest (frontend), Jest + Supertest (backend) |
