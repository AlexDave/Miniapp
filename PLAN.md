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

## Спринт 4: Lesson Loop ✅ (2026-05-02)

### Задачи
- [x] Prisma: добавить модели `Lesson` + `LessonProgress` (миграция `20260502204303_add_lessons`)
- [x] Backend: `utils/xp.js` — начисление XP + level up (5 уровней)
- [x] Backend: `utils/achievements.js` — автовыдача достижений при событиях
- [x] Backend: `routes/lessons.js` — GET уроки курса, GET урок, POST завершение, GET урок дня
- [x] Backend: `tracks.js` — при завершении трека выдаёт +5 XP + проверяет достижения
- [x] Seed: 8 уроков по 5 курсам с теорией и чеклистами
- [x] Frontend: `hooks/useLessons.js` — useCourseLessons, useLesson, useTodayLesson, useCompleteLesson
- [x] Frontend: `LessonView.jsx` — теория + интерактивный чеклист + экран завершения с XP
- [x] Frontend: `CourseDetail.jsx` — список уроков с прогрессом, клик → переход на урок
- [x] Frontend: `Dashboard.jsx` — виджет "Урок дня"

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

## Технический стек

| Слой | Технология |
|------|-----------|
| Frontend | React 18, Vite, Chakra UI, Zustand, React Query |
| Backend | Express.js, Prisma ORM, SQLite (dev) / PostgreSQL (prod) |
| Auth | Telegram WebApp initData + HMAC-SHA256 |
| Тесты | Vitest (frontend), Jest + Supertest (backend) |
