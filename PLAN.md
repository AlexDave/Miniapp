# DogCourse Miniapp — План улучшений

> **Актуализация статуса (синхронизация чеклиста с репо, 2026-05-03):** `[x]` — реализовано; у пункта с *⚠️* или курсивом — реализовано неполно или иначе, чем в формулировке; `[ ]` — нет или не дотянуто до DoD.

## Спринт 1: Безопасность и единая БД ✅

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
- [ ] Настроить ESLint + Prettier на уровне **единого** monorepo-конфига — *⚠️ в `frontend` есть ESLint в devDependencies; общего корневого eslint/prettier нет*
- [x] Тесты: Vitest (frontend), Jest + Supertest (backend) — *уже в спринте 4b; пункт в «Остаётся» был устаревшим*
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

## Спринт 7: Линейный flow урока ✅⚠️

**Цель:** убрать «теорию-в-модалке», сделать урок обязательной последовательностью Зачем→Как→Делаем→Итог с gating-ом.

*Замечания:* фаза «Как» — пошаговая смена шагов (прогресс + «Далее»), не swipe-карусель. Жёсткий DoD (gating без теории, один CTA на «Итоге») — проверять при приёмке.

### Задачи
- [x] Prisma: таблица `LessonProgress` (`user_id`, `lesson_id`, `state`, `theory_seen_at`, `task_started_at`, `last_repeat_at`, `repeats_count`)
- [x] Backend: `POST /api/lessons/:id/theory-seen` — отметить теорию пройденной
- [x] Backend: `POST /api/lessons/:id/start-task` — открыть задание (требует `theory_seen_at`)
- [x] Backend: `GET /api/lessons/:id` возвращает `state` из `LessonProgress`
- [x] Frontend: рефакторинг `LessonView.jsx` — фазы `['Зачем', 'Как', 'Делаем', 'Итог']`
- [x] Frontend: убрать иконку `<Info />` модалки теории, вынести в inline-экраны — *отдельной модалки Info в `LessonView` нет*
- [x] Frontend: фаза «Зачем» — экран из `lesson.meta.why`
- [x] Frontend: фаза «Как» — пошаговый просмотр `LessonStep[]` через `TheoryStep` — *⚠️ не горизонтальная карусель-жест, как в оригинальной формулировке*
- [x] Frontend: фаза «Делаем» — `TaskStepFlow` / чеклист, «Перечитать шаги»
- [x] Frontend: фаза «Итог» — `ReportForm` — *⚠️ отдельная кнопка «Что дальше?» не зафиксирована явно*
- [x] Backend: повтор / «Перепройти» через `repeat-start` → состояние `theory_done`

### DoD
Открываю урок — нельзя нажать «Получилось» без просмотра теории. На Итоге один чёткий CTA. — *⚠️ ручная проверка UX.*

---

## Спринт 8: Косточки вместо XP ✅⚠️

**Цель:** UI-замена XP на «Косточки». Поле `xp` в БД остаётся, из UI убирается.

*Замечания:* стадии и начисление в `utils/bones.js` (нет отдельного `stages.js`). В API отчёта по-прежнему есть `xp_earned` / уровни. Анимация — `BoneCelebrate.jsx`, не `BoneAnimation`. DoD «XP нигде в UI» — перепроверить `grep` по фронту.

### Задачи
- [x] Backend: `utils/bones.js` — `awardBone`, косточки по навыку, особая косточка при streak % 7 — *⚠️ имя `awardBone`; при сдаче отчёта `isRepeat` по сути не прокидывается*
- [x] Backend: 5 стадий — *внутри `bones.js`, не `utils/stages.js`*
- [x] Backend: `GET /api/user/profile/bones` (`profile.js`)
- [x] Backend: `routes/lessons.js` — в ответе есть `bones_earned` — *⚠️ `xp_earned` и уровень тоже возвращаются*
- [x] Frontend: `BoneCounter.jsx`
- [x] Frontend: анимация «падение» — `BoneCelebrate.jsx` — *⚠️ не файл `BoneAnimation.jsx`*
- [x] Frontend: `Profile.jsx` — стадия и косточки
- [x] Frontend: копилка на главной — *⚠️ в `HomeHeaderSummary` / шапке, не отдельный виджет в теле `Dashboard.jsx`*
- [x] Frontend: `LessonView` итог — обёртка с анимацией косточки
- [ ] Migration: `bones = floor(xp / 10)` для существующих профилей

### DoD
Слово «XP» не встречается в UI. Завершение урока анимирует косточку, не цифру. — *⚠️ не закрыто полностью (см. API и миграцию).*

---

## Спринт 9: Атомарное дерево навыков ✅⚠️

**Цель:** расширить 3 плоских навыка до 6 категорий × 18+ атомов.

*Замечания:* прогресс атома считается в `routes/skills.js`, не в отдельном `skillProgress.js`. Связь урока с атомом — через `Lesson.meta` / парсинг, не FK `Lesson.skill_key`. На главной — общий счётчик косточек в шапке, не «только текущий атом».

### Задачи
- [x] Prisma: `SkillCategory` (`key`, `title`, `description`, `icon`, `order_index`)
- [x] Prisma: `Skill` (`key`, `category_key`, `title`, `description`, `unlock_rules`, `order_index`, `target_bones`)
- [ ] Prisma: `Lesson.skill_key` FK + backfill из `meta.skill` — *пока навык в `meta` JSON*
- [x] Backend: seed категорий и атомов — *⚠️ сверить число с планом (18+ и набор категорий) по актуальному `seed.js`*
- [x] Backend: `GET /api/skills/tree` — категории + атомы + прогресс
- [x] Backend: `GET /api/skills/:key/lessons` — уроки атома
- [x] Backend: логика прогресса атома (косточки / цель) — *в `skills.js`*
- [x] Frontend: `SkillsScreen.jsx` — дерево категорий → атомы → уроки
- [x] Frontend: `useSkillTree` / `useLessonsForSkill` (`hooks/useSkillTree.js`)
- [ ] Frontend: главная — мини-копилка **только** текущего атома — *сейчас общие косточки в `HomeHeaderSummary`*

### DoD
«Навыки»: 6 крупных карточек → клик → атомы → уроки. Мягкие рекомендации «сначала…» — *⚠️ проверить полноту UX против формулировки про «заблокированные».*

---

## Спринт 10: Иллюстрации + многоразовость ✅⚠️

**Цель:** функциональные иллюстрации в шагах теории, полная многоразовость уроков.

*Замечания:* `image_role` в схеме — `hero|inline|caption`, не перечень из плана. Папка `public/lesson-images` + `express.static` в коде не найдены — картинки только если URL в данных. Награда при повторе: cooldown на `repeat-start`; начисление косточки при повторном прохождении — уточнить бизнес-логику в отчёте.

### Задачи
- [x] Prisma: `LessonStep.image_url`, `LessonStep.image_role`, `LessonStep.alt_text` — *⚠️ значения `image_role` другие, чем в плане*
- [x] Backend: статика медиа уроков — `backend/public/lesson-media/` + `express.static` в `routes/system.js` (`/lesson-media`) — *⚠️ в плане было имя `lesson-images`*
- [x] Контент: ТЗ в `docs/illustration-brief.md`
- [x] Frontend: `TheoryStep.jsx` — `<img loading="lazy">`, alt, max-width
- [x] Backend: `GET /api/lessons/:id/history`
- [x] Backend: `POST /api/lessons/:id/repeat-start` (24ч cooldown)
- [x] Backend: валидация 24ч на повтор — *⚠️ `awardBone(..., isRepeat)` при финальном отчёте не различает повтор явно*
- [x] Frontend: «Перепройти» / экран завершённого урока
- [x] Frontend: сообщение о cooldown (часы до повтора) — *в `CompletedScreen` и ответе 429*
- [x] Frontend: `repeats_count` в списке уроков навыка — *через API `skills/:key/lessons`*

### DoD
5 пилотных уроков с иллюстрациями. Любой завершённый урок можно перепройти, награда только через 24ч. — *⚠️ иллюстрации в контенте и DoD по 5 урокам не закрыты.*

---

## Спринт 11: Маршруты вместо Треков ✅⚠️

**Цель:** «Треки» → «Персональный маршрут», собираемый на онбординге.

*Замечания:* у `Route` поля `target_problem`, возрастные диапазоны — не `goal_key`/`duration_days` из плана. Активный маршрут хранится в `Profile.preferences.selected_route_key`, не `User.active_route_id`. API выбора — `POST /api/routes/:key/select` (не `start`). `swap` нет. Нижняя навигация — **3 пункта** (Сегодня / Навыки / Я); `/train` и `/tracks` редиректят на главную, `/routes` — в профиль «маршрут».

### Задачи
- [x] Prisma: `Route`, `RouteSkill` — *⚠️ состав полей отличается от черновика в плане*
- [x] Backend: выбранный маршрут пользователя — *через `preferences`, не FK на `User`*
- [x] Backend: seed 4 маршрута (`seed.js`) — *другие названия, но 4 штуки*
- [x] Backend: каталог маршрутов, выбор, пауза/возобновление — *`user-routes.js`; ⚠️ нет `swap`*
- [x] Frontend: `OnboardingWizard.jsx` — шаг выбора маршрута — *⚠️ опции частично захардкожены (`ROUTE_OPTIONS`)*
- [x] Frontend: `RouteCard.jsx`, `RouteProgressMap.jsx`, экран `RoutesScreen`
- [x] Frontend: убрать треки из нав-бара; 3 таба (Сегодня / Навыки / Я) — *`BottomNavigation` в `App.jsx`; легаси-URL редиректятся*
- [x] Подпись «Библиотека» — *в UI ссылок на курсы; файл компонента всё ещё `Courses.jsx`*

### DoD
Новый пользователь после онбординга видит маршрут. «Треков» в нав-баре нет. — *⚠️ слово «трек» может встречаться в README/копирайте; модели `Track`/`UserTrack` в Prisma пока не удалены.*

---

## Спринт 12: Атомарный контент из транскриптов ✅⚠️

**Цель:** заменить gpt-синтетику на 22 урока из реальных транскриптов.

*Замечания:* `backend/data/atomic-lessons.json` — массив `lessons` **24** записи; `seed-content.js` импортирует этот файл. `gpt_coures.json` в репозитории **ещё есть** (источник/архив). Связь урока с атомом по-прежнему через `Lesson.meta` (JSON), не отдельная колонка `skill_key` на `Lesson`.

### Задачи
- [x] Файл `backend/data/atomic-lessons.json` — *24 урока в `lessons[]` (цель плана 22 — перекрыта)*
- [x] Каждый атом с полным набором полей по спецификации плана — *⚠️ сверять поля по мере приёмки контента*
- [x] `seed-content.js` переведён на `atomic-lessons.json` и наполняет БД
- [ ] Mapping / миграция `meta.skill → skill_key` на уровне схемы Prisma (`Lesson.skill_key` FK)
- [ ] Удалить `gpt_coures.json` после окончательной миграции и бэкапа

### DoD
В БД 22 атомарных урока с реальными источниками. `gpt_coures.json` удалён. — *⚠️ ≥22 урока из atomic в сиде есть; файл `gpt_coures.json` пока не удалён.*

---

## Спринт 13: Финальный лоск ✅⚠️

**Цель:** анимации, полка трофеев, аналитика воронки, доступность.

*Замечания:* аналитика — `trackEvent` + таблица `analytics_events`; админ HTML `/api/admin/dashboard`. Code splitting — частично (`React.lazy` в `App.jsx`).

### Задачи
- [x] Frontend: анимация косточки (Framer spring) — `BoneCelebrate.jsx`
- [x] Frontend: «Полка трофеев» — `TrophyShelf.jsx` в профиле
- [ ] Frontend: пустые состояния с CTA на **каждом** экране — *частично / не везде*
- [x] Frontend: при «Не получилось» в ответе есть `fallback_tasks` — *⚠️ отдельный «дружественный» экран глубины — см. спринт 18*
- [x] Backend: лог-события `lesson.theory_seen`, `lesson.completed`, `lesson.repeated`, `route.started`, `bone.awarded` — *через `utils/analytics.js` → pino*
- [x] Backend: `GET /api/admin/funnel` — агрегаты (онбординг, ≥1 урок, streak ≥7)
- [x] Доступность: контраст (`mutedFg`), 44px+, `prefers-reduced-motion` — *спринт 25; полный аудит всех экранов не заявлен*
- [x] Frontend: `React.lazy` для ряда экранов — *⚠️ не все тяжёлые страницы вынесены по плану спринта 25*
- [ ] Обновить `README.md` — *уточнить актуальность относительно репо*

---

# Доп. бэклог по итогам UX-аудита (2026-05-03)

Аудит показал три класса проблем:
1. **Концептуальный шум** — Курсы/Библиотека/Треки/Маршруты/Навыки/Категории/Атомы/Уроки/Косточки/XP — слишком много сущностей в UI.
2. **Дублирование** — `Dashboard.TodayLesson` и `TrainScreen` показывают одно и то же.
3. **Контентная пустота** — нет видео/иллюстраций, «Не получилось» обрывается, уроки не работают hands-free с собакой.

Спринты ниже — продолжение бэклога после 7-13. Группировка по фазам: **A** сокращение, **B** контент, **C** удержание, **D** продакшн.

**Сводка 14–26:** **23–26** в основном закрыты по коду; **14–16** частично совпали с текущим репо (короткий онбординг, 3 таба, удалены старые экраны треков); **17–19** и глубина «Не получилось» — в основном `[ ]` или *⚠️*; **20–22** реализованы по ключевым API/UI, DoD местами только ручной проверкой.

---

## Фаза A — Сокращение и фокус

### Спринт 14: Онбординг 5→2 шага ✅⚠️

**Цель:** довести юзера до первого урока за минимум кликов; убрать рассинхрон с бэком.

#### Задачи
- [x] `OnboardingWizard.jsx`: только 2 шага — кличка + возрастная корзина (`STEPS = 2`)
- [x] Нет hardcoded `ROUTE_OPTIONS` в мастере — маршрут задаётся на бэке (`routeKeyForAgeBucket` и т.д.)
- [x] Backend: `POST /api/onboarding/complete` — ответ с `route_key` и `first_lesson_id`
- [ ] Шаги «цели» и «главная проблема» — спросить ВНУТРИ первого урока (`Зачем` фаза) или после 3-го дня — *пока в prefs обнуляются при complete; отдельного сбора в уроке нет*
- [x] После онбординга: редирект на `/lesson/:firstId` при наличии id, иначе на `/`
- [x] Экран рекомендаций убран — редирект `/onboarding/recommendations` → `/` в `App.jsx`
- [x] `OnboardingGate`: пропуск онбординга, если уже есть `selectedRouteKey`

#### DoD
Новый юзер от старта до фразы «Зачем тренировать "Сидеть"» — не больше 3 экранов. — *⚠️ зависит от текста первого урока; цели/проблема вне урока не собираются.*

---

### Спринт 15: Консолидация навигации ✅⚠️

**Цель:** 3 таба вместо 5; убрать дубли «Сегодня/Тренировка»; ампутировать Tracks.

#### Задачи
- [x] `BottomNavigation`: **Сегодня · Навыки · Я** (`App.jsx`)
- [x] `TrainScreen.jsx` отсутствует; практика дня — `Dashboard` + `DashboardTodayPractice`
- [x] Маршрут — крупная `RouteCard` на `Dashboard`
- [x] Роутинг: `/train`, `/tracks` → редирект; `/routes` → `/profile/marshrut`
- [x] Нет `Tracks.jsx` / `TrackCard.jsx` / `useTracks.js` / бэкенд `routes/tracks.js` в репо
- [x] Библиотека — `Library.jsx`, маршрут — из профиля (`/profile/marshrut`, `RoutesScreen`)
- [ ] Migration: данные из `Track`/`UserTrack` → `Route`/`UserRoute` или дроп таблиц — *модели `Track`/`UserTrack` в схеме ещё есть*

#### DoD
В nav 3 пункта. Слово «трек» не встречается в UI и в коде frontend. — *⚠️ возможны вхождения в README/корневом описании; Prisma-модели треков сохранены.*

---

### Спринт 16: Чистка моков и мёртвых ссылок ✅⚠️

**Цель:** убрать всё, что притворяется работающим.

#### Задачи
- [x] `Profile.jsx`: блок «Сильнейшие атомы» из `useSkillTree` / маршрута, без hardcoded `[focus, sit, recall]`
- [x] Премиум-баннер за `featurePayments` (`VITE_FEATURE_PAYMENTS`)
- [x] Поддержка: кнопки дают информирующий toast («скоро») — *не полноценные экраны*
- [x] `seed.js` достижения: типы `routes_completed`, `bones_earned` и др.
- [x] Нет `LevelBadge` / `XPAnimation` в компонентах — *⚠️ в ответах API урока по-прежнему может быть XP*
- [x] Отдельного `Notifications.jsx` / колокольчика в шапке нет

#### DoD
Каждая видимая кнопка либо работает, либо невидима. `grep -r "XP\|Track\|focus.*sit.*recall"` пуст. — *⚠️ строка «XP» в UI/API и «трек» в доках — перепроверять `grep`.*

---

## Фаза B — Контент: то, без чего продукт пустой

### Спринт 17: Hands-free режим урока ✅⚠️

**Цель:** во время «Делаем» телефон лежит, я работаю с собакой.

#### Задачи
- [x] `TaskStepFlow.jsx`: таймер **60–90 с** на шаг, авто-переход
- [ ] Web Speech API / TTS озвучивание шага — *не реализовано*
- [x] Крупные действия «Готово» и зона свайпа вниз «Не получилось» — *см. `TaskStepFlow`*
- [x] Screen Wake Lock на странице урока (`LessonView.jsx`)
- [x] `navigator.vibrate` на шаге — *уважает тихий режим*
- [x] Профиль: «Тихий режим урока» (`lesson_quiet_mode`) — без вибро; TTS пока нечего отключать
- [x] `Telegram.WebApp.disableVerticalSwipes()` в `LessonView`

#### DoD
Можно пройти урок ни разу не глядя в экран после старта. Экран не гаснет 5 минут. — *⚠️ без TTS hands-free неполный; DoD — ручная проверка.*

---

### Спринт 18: «Не получилось» с глубиной ✅⚠️

**Цель:** провал — не тупик, а развилка.

#### Задачи
- [x] Schema: `Lesson.fallback_tree` (JSON L1/L2/L3 + faq)
- [ ] `seed-content.js`: для **каждого** атома полные L1/L2/L3 — *⚠️ заполненность зависит от контента в JSON*
- [x] `LessonView`: при провале передаётся `fallbackTree` в экран глубины (см. `bonesResult` / компонент с `fallbackTree`)
- [x] Backend / Prisma: `LessonProgress.attempts_at_level` (JSON)
- [ ] Три провала на L3 → «Спросить у тренера» / шаблон — *не зафиксировано*
- [ ] Отдельный FAQ-блок со ссылками на смежные атомы внизу экрана провала — *частично через `fallback_tree.faq`*

#### DoD
После «Не получилось» юзер всегда имеет 1 содержательный следующий шаг, не «К тренировке». — *⚠️ ручная приёмка по UX.*

---

### Спринт 19: Демонстрационные иллюстрации (расширение сп.10) ✅⚠️

**Цель:** покрыть 22 атома GIF/видео-демо, не статикой.

#### Задачи
- [x] `docs/illustration-brief.md` — есть (детали GIF можно доуточнять)
- [x] Prisma: `LessonStep.media_type`, `media_url`, `poster_url`
- [x] Backend: `public/lesson-media/` + `Cache-Control` в `system.js`
- [x] `TheoryStep.jsx` / `LazyStepMedia.jsx`: рендер video/gif/image
- [ ] Контент: 22 атома × шаги с реальными GIF/MP4 — *⚠️ инфраструктура есть, массового контента нет*
- [x] Lazy / `loading="lazy"` / `react-intersection-observer` в медиа-компонентах — *⚠️ не везде одинаково*
- [x] Fallback постер / картинка при ошибке загрузки — *где предусмотрено в компонентах*

#### DoD
В каждом из 22 атомов хотя бы 1 шаг с видео-демонстрацией. — *⚠️ не закрыто по объёму контента.*

---

## Фаза C — Удержание и связь с реальностью

### Спринт 20: Telegram-бот напоминания ✅⚠️

**Цель:** нативный канал для возврата без push-инфраструктуры.

#### Задачи
- [x] Backend: `node-cron` в `jobs/reminderCron.js` — *⚠️ тик **каждые 10 минут** с окном ±14 мин к `reminder_time`, не строго «каждый час»*
- [x] Schema / `User`: `reminder_time`, `reminder_tz`, `reminders_enabled`, `reminder_quiet_weekends`, `last_reminder_sent_at`, `telegram_chat_id`
- [x] Привязка чата: токены `ReminderBindToken`, `/start bind_*` в `telegramWebhook.js`, ссылка `GET /api/user/profile/reminder-bind-link`
- [x] Job: выборка пользователей с напоминаниями, отправка в Telegram, deeplink на мини-приложение
- [x] Пропуск, если сегодня уже был успешный отчёт по питомцу / напоминание уже слали — *логика в `reminderCron.js` + `reminderTz.js`*
- [x] Профиль: время, TZ, тихие выходные, переключатель (`Profile.jsx` + `profile.js`)
- [x] Не больше одного напоминания в сутки (по TZ пользователя)

#### DoD
Юзер с `reminder_time=19:00` получает 1 сообщение в 19:00 в дни, когда не тренировался. — *⚠️ проверка с реальным ботом и webhook.*

---

### Спринт 21: Журнал поведения ✅⚠️

**Цель:** связать реальные проблемы с уроками.

#### Задачи
- [x] Schema: `BehaviorEvent` с полями `user_id`, `type`, `note`, `severity`, `created_at`
- [x] Backend: `POST /api/behavior/log`, `GET /api/behavior` (+ подсказка атома в ответе)
- [x] Dashboard: кнопка «Отметить инцидент» → `BehaviorIncidentDrawer`
- [x] `backend/data/behavior-suggestions.json` — маппинг тип → навык
- [x] После лога: toast с текстом и ссылкой на раздел навыков — *⚠️ не отдельный push-сценарий «3 случая за неделю»*
- [x] Профиль: `BehaviorTimeline` + блок `stats.highlights` из API

#### DoD
Каждый залогированный инцидент имеет 1 рекомендуемый атом для тренировки. — *⚠️ если для типа нет строки в JSON, подсказка может отсутствовать.*

---

### Спринт 22: Эмоциональная награда и видео-полка ✅⚠️

**Цель:** косточка = конкретный микро-навык, а не абстрактное число.

#### Задачи
- [x] Prisma: `Skill.atomic_outcome` — текст микро-результата
- [ ] `LessonView` Итог: полная замена копирайта на «{petName} теперь умеет: …» — *частично / зависит от экрана награды*
- [x] Backend: `POST /api/lessons/:id/video` (multipart), хранение в `public/user-videos/`, подписанные URL
- [x] Frontend: `LessonVictoryVideoUpload.jsx` — загрузка видео после урока
- [x] `Profile.jsx`: `TrophyVideoShelf` — превью и подписи
- [x] Видео привязано к `user_id` + раздача через авторизованные маршруты медиа

#### DoD
На Полке трофеев минимум 1 видео после 3 завершённых уроков с записью. — *⚠️ автоматически не гарантируется; нужен пользовательский ввод.*

---

## Фаза D — Готовность к продакшну

### Спринт 23: Платежи Telegram Stars ✅⚠️ (2026-05-03)

**Цель:** заменить мок-баннер на работающую покупку.

*Замечания:* модель — **продление Pro на N дней** за Stars (`PRO_SUBSCRIPTION_DAYS`, по умолчанию 30). Эндпоинт: `POST /api/payments/stars-invoice` (не `/invoice`). Gating: в seed `requires_pro` у **`city-dog`** и **`calm-home`**; онбординг для `older` без Pro уводит на **`foundations`**. Refund — **заглушка** `POST /api/admin/payments/refund` → 501.

#### Задачи
- [x] Решить модель: подписка vs одноразовая разблокировка маршрута vs free-форевер — *подписка по дате `tier_expires_at`, продление при повторной оплате*
- [x] Schema: `User.tier` (`free|pro`), `User.tier_expires_at`, `Payment` лог
- [x] Backend: `POST /api/payments/stars-invoice` — `createInvoiceLink` (XTR)
- [x] Webhook `pre_checkout_query` + `successful_payment` → апдейт `User.tier`
- [x] Frontend: `Profile.jsx` (при `VITE_FEATURE_PAYMENTS`) → `Telegram.WebApp.openInvoice()`
- [x] Gating: премиум-маршруты (`Route.requires_pro`) — только для Pro
- [x] Refund-эндпоинт + soft-grace 3 дня после expiry — *grace в `utils/tier.js`; refund — заглушка в admin*

#### DoD
Реальная транзакция Stars проходит, `tier` меняется, премиум-маршрут разблокируется. — *⚠️ проверка только в Telegram Mini App с реальным ботом и webhook.*

---

### Спринт 24: Аналитика воронки (расширение сп.13) ✅

**Цель:** мерить, иначе нельзя итерировать.

#### Задачи
- [x] Backend: `AnalyticsEvent` table (`user_id`, `event`, `props` JSON, `ts`)
- [x] События: *⚠️ `onboarding.start`, `route.completed`, `reminder.opened` — не добавлены*; остальное из списка: `onboarding.complete`, `lesson.opened`, `lesson.theory_seen`, `lesson.task_started`, `lesson.completed` / `lesson.failed`, `lesson.repeated`, `lesson.retry_after_fail`, `route.started`, `bone.awarded`, `reminder.sent`, `reminder.bot_linked`, `behavior.logged`, `payment.invoice_created`, `payment.success`
- [x] `GET /api/admin/funnel?from=&to=` — снимок воронки + `events_totals` / `events_by_day`
- [x] `GET /api/admin/cohort?week_start=` — retention D1/D7/D30 (UTC-неделя)
- [x] HTML-дашборд `GET /api/admin/dashboard` (Chart.js)
- [x] Auth: `X-Admin-Key` или `Authorization: Bearer` = `ADMIN_API_KEY`

#### DoD
В админке видно: % онбординг→1-й урок, D1/D7/D30 retention, lesson success rate.

---

### Спринт 25: Доступность и performance ✅

**Цель:** соответствие WCAG AA + быстрый старт mini-app.

#### Задачи
- [x] Контраст вторичного текста: семантический `mutedFg` (gray.600 / gray.400), правки `HomeHeaderSummary`, замена `gray.500` на `mutedFg` в ключевых экранах
- [x] Интерактивы ≥44×44: нижняя навигация, `SiteHeader` theme toggle, раскрытие в `RouteCard` / `SkillsScreen` (chevron)
- [x] `prefers-reduced-motion`: `ReducedMotionAnimatePresence`, отключение scale/hover в навигации и карточках, нулевая длительность переходов в уроке/задании, `PressableButton` / `AnimatedProgressBar` / burst в `TaskStepFlow`
- [x] `aria-live` / `role="status"`: экран награды урока (`LessonView`), `BoneDropAnimation`
- [x] Code splitting: `React.lazy` уже для `Profile`, `SkillsScreen`, `Library`, `LessonView` + `manualChunks` в Vite (react-dom, chakra, motion, …)
- [x] Размер бандла: после split entry `index-*.js` ≈ **9 KB gzip** (раньше один чанк ~189 KB gzip); *⚠️ сумма критических чанков при первом открытии всё ещё >200 KB gzip — дальше можно убрать неиспольз. MUI / ужать Chakra*
- [x] Ранняя подгрузка `useTodayLesson`: `void import('./hooks/useLessons.js')` в `index.jsx` (hash-safe в prod; в `index.html` только `lang="ru"`)
- [x] Lighthouse CI: job `lighthouse` в `.github/workflows/ci.yml`, `frontend/lighthouserc.cjs`, `npm run lhci`; *⚠️ пороги статические (a11y/best-practices ≥0.88, perf — warn); сравнение «регрессия >5» к базе — без LHCI upload не автоматизировано*

#### DoD
Lighthouse Mobile ≥ 90 по Performance/Accessibility/Best Practices. — *⚠️ в CI заданы минимальные пороги 0.88 (a11y/bp) и warn по perf; 90+ — цель для ручного прогона после оптимизаций.*

---

### Спринт 26 (опц.): Семейный режим ✅

**Цель:** один питомец, несколько хозяев — общий прогресс.

#### Задачи
- [x] Schema: `Pet` (отделить от `User`), `PetMember` (`pet_id`, `user_id`, `role`), `PetInviteToken`
- [x] Migration: 1 user → 1 pet (default), invite по ссылке
- [x] Backend: `POST /api/pets/:id/invite` → одноразовый токен (URL `t.me/...?start=pet_*` при заданном `TELEGRAM_BOT_USERNAME`)
- [x] Backend: `POST /api/pets/join/:token` → присоединение; `GET /api/pets/mine`, `GET /api/pets/activity`; в `mine` поле `my_role` для UI
- [x] Frontend: Dashboard — блок «Недавние уроки питомца» (`/api/pets/activity`)
- [x] Профиль: «Хозяева …» список + «Пригласить по ссылке» (владелец); в настройках — ввод токена и «Присоединиться»
- [x] Косточки, стадия, стрик, XP, отчёты — на `pet_id` (прогресс/skills/user-routes/progress и др.)

#### DoD
2 telegram-аккаунта тренируют 1 виртуального щенка, прогресс синхронизирован. — *⚠️ проверить вручную двумя аккаунтами; автоприём `/start pet_*` в webhook — по желанию.*

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
