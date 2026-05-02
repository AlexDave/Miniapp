# План реализации: Daily Skill Loop Platform

> Переход от пассивных курсов с видео к ежедневной практике с микро-уроками, геймификацией и визуализацией прогресса.

---

## Архитектура изменений

### Новая иерархия контента

```
Course (курс)
  └── Module (модуль, 1–2 недели)
        └── Lesson (урок = 1 день)
              └── LessonStep (шаги урока: текст, схема, иллюстрация)
              └── DailyTask (задание дня)
                    └── TaskStep (шаги задания: чекбокс, число, смайл)

DailyReport (отчёт пользователя за день)
  └── привязан к Lesson + User
  └── хранит заполненные шаги, оценку, XP
```

### Новая модель XP

```
Выполнил задание дня          → +10 XP
Заполнил отчёт с данными      → +5 XP
3-дневный стрик               → +15 XP
Завершил модуль               → +50 XP
Результат теста 5/5           → +25 XP
```

---

## Спринт 4: Новая модель данных

### 4.1 Prisma Schema — добавить модели

**Файл:** `backend/prisma/schema.prisma`

Добавить в конец файла:

```prisma
// Модуль курса (1–2 недели контента)
model Module {
  id          Int      @id @default(autoincrement())
  course_id   Int
  title       String
  description String?
  order_index Int      @default(0)
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  course      Course   @relation(fields: [course_id], references: [id], onDelete: Cascade)
  lessons     Lesson[]

  @@map("modules")
}

// Урок = 1 день практики
model Lesson {
  id          Int      @id @default(autoincrement())
  module_id   Int
  title       String
  description String?
  theory      String?  // Markdown-текст теории (карточки, схемы)
  order_index Int      @default(0)
  xp_reward   Int      @default(10)
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  module      Module        @relation(fields: [module_id], references: [id], onDelete: Cascade)
  steps       LessonStep[]
  daily_task  DailyTask?
  reports     DailyReport[]

  @@map("lessons")
}

// Шаг урока (теоретический контент)
model LessonStep {
  id          Int      @id @default(autoincrement())
  lesson_id   Int
  type        String   // "text" | "diagram" | "card" | "tip"
  content     String   // Markdown или JSON-схема
  order_index Int      @default(0)
  created_at  DateTime @default(now())

  lesson      Lesson   @relation(fields: [lesson_id], references: [id], onDelete: Cascade)

  @@map("lesson_steps")
}

// Задание дня
model DailyTask {
  id          Int      @id @default(autoincrement())
  lesson_id   Int      @unique
  title       String
  description String?
  duration_min Int     @default(15)  // рекомендуемое время в минутах
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  lesson      Lesson       @relation(fields: [lesson_id], references: [id], onDelete: Cascade)
  steps       TaskStep[]

  @@map("daily_tasks")
}

// Шаг задания (то что пользователь выполняет)
model TaskStep {
  id          Int      @id @default(autoincrement())
  task_id     Int
  type        String   // "checkbox" | "counter" | "rating" | "text"
  label       String   // Текст шага
  max_value   Int?     // Для counter: максимальное значение
  order_index Int      @default(0)
  created_at  DateTime @default(now())

  task        DailyTask @relation(fields: [task_id], references: [id], onDelete: Cascade)

  @@map("task_steps")
}

// Отчёт пользователя за день
model DailyReport {
  id           Int      @id @default(autoincrement())
  user_id      Int
  lesson_id    Int
  steps_data   String   // JSON: [{step_id, value}]
  rating       Int      @default(2)  // 1=плохо, 2=нормально, 3=отлично
  note         String?
  xp_earned    Int      @default(0)
  completed_at DateTime @default(now())

  user         User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  lesson       Lesson   @relation(fields: [lesson_id], references: [id], onDelete: Cascade)

  @@unique([user_id, lesson_id])
  @@map("daily_reports")
}
```

Добавить в модель `Course`:
```prisma
  modules     Module[]
```

Добавить в модель `User`:
```prisma
  dailyReports DailyReport[]
```

### 4.2 Обновить Profile — добавить XP и уровни

В модели `Profile` поле `experience` уже есть. Добавить логику уровней:

```
Уровень 1: 0–99 XP    → "Новичок"
Уровень 2: 100–299    → "Практик"
Уровень 3: 300–699    → "Наставник"
Уровень 4: 700–1499   → "Тренер"
Уровень 5: 1500+      → "Мастер"
```

Вычислять на лету в API, не хранить в БД.

### 4.3 Миграция

```bash
cd backend
npx prisma migrate dev --name add_modules_lessons_reports
npx prisma generate
```

---

## Спринт 5: Backend — новые API-роуты

### 5.1 Маршруты уроков

**Создать:** `backend/src/routes/lessons.js`

```
GET  /api/lessons/today
     → урок дня для текущего пользователя
     → логика: найти первый незавершённый урок активного модуля
     → ответ: { lesson, module, course, daily_task { steps }, is_completed }

GET  /api/courses/:courseId/modules
     → список модулей курса с прогрессом пользователя

GET  /api/modules/:moduleId/lessons
     → список уроков модуля со статусом (completed/current/locked)

POST /api/lessons/:lessonId/report
     → сохранить отчёт пользователя за урок
     → тело: { steps_data: [{step_id, value}], rating, note }
     → логика:
         1. Создать DailyReport
         2. Рассчитать XP (базовый + бонус за данные)
         3. Обновить Profile.experience
         4. Обновить стрик
         5. Проверить достижения
         6. Вернуть { xp_earned, new_total_xp, level_up, achievements_unlocked }

GET  /api/lessons/:lessonId/report
     → получить отчёт пользователя за конкретный урок (если есть)
```

### 5.2 Маршруты прогресса

**Создать:** `backend/src/routes/progress.js`

```
GET  /api/user/skill-map
     → данные для карты навыков
     → ответ: { skills: [{ name, category, score: 0–5, lessons_done, lessons_total }] }

GET  /api/user/activity
     → данные тепловой карты (последние 90 дней)
     → ответ: { days: [{ date, xp, lessons_count }] }

GET  /api/user/stats
     → расширенная статистика
     → ответ: { total_xp, level, level_name, streak, reports_count, modules_done }
```

### 5.3 Логика XP в helpers

**Создать:** `backend/src/utils/xp.js`

```javascript
// Константы XP
const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  REPORT_WITH_DATA: 5,    // бонус если заполнены числовые поля
  STREAK_3: 15,
  STREAK_7: 30,
  MODULE_COMPLETE: 50,
  PERFECT_SCORE: 25,      // rating === 3 (отлично)
};

function calculateXP(report, streakCount) { ... }
function getLevelByXP(xp) { ... }
function getLevelName(level) { ... }
```

### 5.4 Обновить достижения

**Файл:** `backend/src/routes/achievements.js`

Добавить новые условия проверки:
```javascript
{ type: 'reports_streak', value: 10 }    // "Данные не врут" — 10 отчётов подряд
{ type: 'perfect_reports', value: 5 }    // "Перфекционист" — 5 оценок "отлично"
{ type: 'module_complete', value: 1 }    // "Первый модуль"
{ type: 'skill_score', skill: 'leash', value: 5 }  // "Мастер поводка"
```

### 5.5 Зарегистрировать роуты

**Файл:** `backend/src/routes/index.js`

```javascript
const lessonsRouter = require('./lessons');
const progressRouter = require('./progress');

router.use('/lessons', lessonsRouter);
router.use('/user', progressRouter);
```

---

## Спринт 6: Seed — контент уроков

### 6.1 Обновить seed.js

**Файл:** `backend/src/seed.js`

Добавить полноценный контент для курса "Базовые команды" (Модуль 1 "Сидеть", 7 дней):

```javascript
const modules = [
  {
    course_title: 'Базовые команды',
    title: 'Команда «Сидеть»',
    description: 'Первая и самая важная команда. За 7 дней ваша собака будет садиться по первому слову.',
    order_index: 1,
    lessons: [
      {
        title: 'День 1: Почему позитивное подкрепление работает',
        theory: `## Как учится собака\n\nСобаки учатся через **ассоциации**: поведение → последствие.\n\n### Три правила\n1. **Лакомство сразу** — не через 3 секунды, а в момент правильного действия\n2. **Маленькие порции** — размером с горошину\n3. **Короткие сессии** — 2–3 минуты, 3 раза в день\n\n> Принцип: собака повторяет то, за что получает награду.`,
        steps: [
          { type: 'card', content: 'Почему не наказание: наказание учит бояться, а не понимать что правильно' },
          { type: 'diagram', content: '{"type":"sequence","items":["Команда","Собака делает","Лакомство сразу","Повторение"]}' },
          { type: 'tip', content: 'Используйте лакомство которое собака любит БОЛЬШЕ обычного корма' },
        ],
        daily_task: {
          title: 'Подготовка к тренировкам',
          description: 'Сегодня только наблюдаем и готовимся.',
          duration_min: 5,
          steps: [
            { type: 'checkbox', label: 'Нашёл лакомство (варёная курица / сыр / сосиска)' },
            { type: 'checkbox', label: 'Выбрал тихое место без отвлечений' },
            { type: 'checkbox', label: 'Убрал обычную миску с едой за 1 час до тренировки' },
            { type: 'rating', label: 'Как настроена собака прямо сейчас?' },
          ],
        },
      },
      {
        title: 'День 2: Первый контакт с командой',
        theory: `## Метод «заманивания»\n\nДержим лакомство у носа → медленно ведём руку над головой → когда зад опускается — даём лакомство и говорим «Сидеть».`,
        steps: [
          { type: 'diagram', content: '{"type":"position","label":"Рука с лакомством у носа, ведём назад-вверх"}' },
          { type: 'tip', content: 'Не говорите «сидеть» пока собака не села — иначе команда потеряет смысл' },
        ],
        daily_task: {
          title: 'Первые повторения',
          description: '3 сессии по 2 минуты с перерывом 30 минут',
          duration_min: 10,
          steps: [
            { type: 'counter', label: 'Сколько раз из 5 собака села?', max_value: 5 },
            { type: 'checkbox', label: 'Давал лакомство сразу (не через 3 секунды)' },
            { type: 'checkbox', label: 'Сессия длилась не больше 3 минут' },
            { type: 'rating', label: 'Общее впечатление от занятия?' },
          ],
        },
      },
      // ... дни 3–7 по аналогии
    ],
  },
];
```

### 6.2 Полный список модулей по курсам

| Курс | Модули |
|------|--------|
| Базовые команды | М1: Сидеть (7д), М2: Лежать (7д), М3: Ко мне (7д) |
| Контроль поводка | М1: Стоп-и-жди (7д), М2: Рядом (7д) |
| Социализация | М1: Звуки (5д), М2: Люди издалека (7д), М3: Другие собаки (7д) |
| Спортивная дрессировка | М1: Слалом (7д), М2: Прыжок (7д), М3: Апорт (7д) |
| Коррекция поведения | М1: Прыжки на людей (7д), М2: Лай (7д), М3: Порча вещей (7д) |

**Итого контента:** 18 модулей × ~6 уроков = ~108 уроков

---

## Спринт 7: Frontend — новые компоненты

### 7.1 Структура новых компонентов

```
frontend/src/components/
  ├── lesson/
  │   ├── LessonCard.jsx        -- карточка урока в списке модуля
  │   ├── LessonView.jsx        -- полный экран урока (теория + задание)
  │   ├── TheoryStep.jsx        -- один шаг теории (текст / диаграмма / карточка)
  │   ├── TaskChecklist.jsx     -- интерактивный чеклист задания
  │   └── ReportForm.jsx        -- форма отчёта (смайлы + шаги + заметка)
  ├── progress/
  │   ├── SkillMap.jsx          -- карта навыков (SVG-граф)
  │   ├── ActivityHeatmap.jsx   -- тепловая карта активности
  │   └── RadarChart.jsx        -- радар-чарт по 5 категориям
  ├── gamification/
  │   ├── XPAnimation.jsx       -- анимация +XP после отчёта
  │   ├── LevelBadge.jsx        -- бейдж уровня (Новичок / Практик / ...)
  │   └── StreakBadge.jsx       -- бейдж стрика с огнём
  └── TodayLesson.jsx           -- виджет «Урок дня» на Dashboard
```

### 7.2 LessonView.jsx — главный экран

**Логика навигации внутри урока:**

```
Шаг 1: Теория (TheoryStep × N)
  → кнопка "Понял, к заданию"

Шаг 2: Задание (TaskChecklist)
  → пользователь отмечает шаги ВО ВРЕМЯ тренировки
  → кнопка "Вернулся, отмечаю результат"

Шаг 3: Отчёт (ReportForm)
  → смайл-оценка (1/2/3)
  → числовые поля (если есть counter-шаги)
  → опциональная заметка
  → кнопка "Сохранить"

Шаг 4: Анимация XP (XPAnimation)
  → "+10 XP" с конфетти
  → preview следующего дня
  → кнопка "На главную"
```

### 7.3 TaskChecklist.jsx — чеклист задания

```jsx
// Пример структуры компонента
const TaskChecklist = ({ steps, onComplete }) => {
  const [values, setValues] = useState({});
  
  // Рендер разных типов шагов:
  // checkbox → Checkbox от Chakra UI
  // counter  → NumberInput с max_value
  // rating   → 5 звёзд или 3 смайла
  // text     → Textarea
  
  return (
    <VStack>
      {steps.map(step => <StepRenderer step={step} ... />)}
      <Button onClick={() => onComplete(values)}>Задание выполнено</Button>
    </VStack>
  );
};
```

### 7.4 ReportForm.jsx — форма отчёта

```jsx
// Три смайла вместо звёзд:
const RATINGS = [
  { value: 1, emoji: '😕', label: 'Плохо' },
  { value: 2, emoji: '😐', label: 'Нормально' },
  { value: 3, emoji: '😊', label: 'Отлично' },
];
```

### 7.5 SkillMap.jsx — карта навыков

**Визуализация:** узлы = команды/навыки, рёбра = зависимости, цвет = прогресс

```
Цветовая схема:
  ⬜ gray   — не начато
  🔵 blue   — в процессе (1–3 урока сделаны)
  🟡 yellow — почти готово (4–6 уроков)
  🟢 green  — завершено (модуль пройден)
```

**Библиотека:** Recharts (уже в экосистеме) или чистый SVG + Framer Motion

### 7.6 ActivityHeatmap.jsx — тепловая карта

**Данные:** последние 90 дней, интенсивность = XP за день

```
0 XP     → ⬜ (пусто)
1–10 XP  → 🟩 светлый
11–25 XP → 🟩 средний
25+ XP   → 🟩 тёмный
```

**Библиотека:** react-calendar-heatmap (добавить в package.json)

### 7.7 XPAnimation.jsx — анимация XP

```jsx
// Использовать Framer Motion для:
// 1. Число XP влетает снизу и увеличивается
// 2. Прогресс-бар уровня заполняется
// 3. Если level_up === true → отдельная анимация "Level Up!"
// 4. Конфетти при достижении
```

### 7.8 Обновить Dashboard.jsx

Добавить вверху виджет "Урок дня":

```jsx
// Новый блок в Dashboard (приоритет #1):
<TodayLesson>
  Сегодня: День 3 из 7 — «Первые повторения»
  Курс: Базовые команды → Модуль «Сидеть»
  [Начать урок →]
</TodayLesson>

// Существующий блок активных треков — ниже
```

### 7.9 Новые хуки

**Создать:** `frontend/src/hooks/useLessons.js`

```javascript
export const useTodayLesson = () => useQuery(['lesson', 'today'], fetchTodayLesson);
export const useModules = (courseId) => useQuery(['modules', courseId], () => fetchModules(courseId));
export const useLessons = (moduleId) => useQuery(['lessons', moduleId], () => fetchLessons(moduleId));
export const useSubmitReport = () => useMutation(submitReport, {
  onSuccess: (data) => {
    // показать XPAnimation
    // инвалидировать кеш профиля и урока
    queryClient.invalidateQueries(['profile']);
    queryClient.invalidateQueries(['lesson', 'today']);
  }
});
```

**Создать:** `frontend/src/hooks/useProgress.js`

```javascript
export const useSkillMap = () => useQuery(['skill-map'], fetchSkillMap);
export const useActivity = () => useQuery(['activity'], fetchActivity);
export const useUserStats = () => useQuery(['stats'], fetchUserStats);
```

---

## Спринт 8: Обновление геймификации

### 8.1 Новые достижения в seed.js

```javascript
const newAchievements = [
  {
    name: 'Данные не врут',
    description: 'Заполняй отчёт 10 дней подряд',
    icon: 'BarChart',
    color: 'teal',
    condition: JSON.stringify({ type: 'reports_streak', value: 10 }),
  },
  {
    name: 'Перфекционист',
    description: 'Получи оценку "Отлично" 5 раз',
    icon: 'Star',
    color: 'yellow',
    condition: JSON.stringify({ type: 'perfect_reports', value: 5 }),
  },
  {
    name: 'Первый модуль',
    description: 'Завершил первый модуль',
    icon: 'BookOpen',
    color: 'blue',
    condition: JSON.stringify({ type: 'modules_complete', value: 1 }),
  },
  {
    name: 'Мастер поводка',
    description: 'Завершил модуль "Контроль поводка"',
    icon: 'Link',
    color: 'green',
    condition: JSON.stringify({ type: 'module_category', value: 'leash' }),
  },
  {
    name: 'Социальная бабочка',
    description: 'Завершил все уровни социализации',
    icon: 'Users',
    color: 'purple',
    condition: JSON.stringify({ type: 'module_category', value: 'social' }),
  },
];
```

### 8.2 Гибкий стрик

**Файл:** `backend/src/utils/streak.js`

```javascript
// Правила:
// - Выполнил полностью → стрик +1
// - Выполнил частично (хотя бы 1 шаг) → стрик не рвётся, но +0
// - Пропустил → стрик обнуляется
// - "Заморозка" 1 раз в неделю — не рвёт стрик при пропуске

function updateStreak(profile, reportDate, isPartial) { ... }
function canUseFreeze(profile) { ... }  // проверить last_freeze_at
```

---

## Спринт 9: Новый контент (остальные курсы)

### 9.1 Приоритет заполнения seed.js

1. **Базовые команды** — полный контент (21 урок) — Спринт 6
2. **Контроль поводка** — полный контент (14 уроков) — Спринт 9
3. **Коррекция поведения** — протоколы (15 уроков) — Спринт 9
4. **Социализация** — дерево уровней (19 уроков) — Спринт 10
5. **Спортивная дрессировка** — челленджи (21 урок) — Спринт 10

### 9.2 Шаблон урока для контент-наполнения

```javascript
{
  title: 'День X: [Название]',
  theory: `## [Заголовок]\n\n[Текст]\n\n### [Подраздел]\n[Текст]`,
  steps: [
    { type: 'text',    content: '[Объяснение]' },
    { type: 'diagram', content: '{"type":"[тип]","label":"[подпись]"}' },
    { type: 'tip',     content: '[Практический совет]' },
    { type: 'card',    content: '[Ключевой факт]' },
  ],
  daily_task: {
    title: '[Название задания]',
    description: '[Описание]',
    duration_min: 10,
    steps: [
      { type: 'checkbox', label: '[Что сделать]' },
      { type: 'counter',  label: '[Что посчитать]', max_value: 5 },
      { type: 'rating',   label: '[Что оценить]' },
    ],
  },
}
```

---

## Роадмап по спринтам

| Спринт | Фокус | Файлы |
|--------|-------|-------|
| **4** | Prisma: Module, Lesson, DailyTask, DailyReport | `schema.prisma`, миграция |
| **5** | Backend API: `/lessons`, `/progress`, XP-логика | `routes/lessons.js`, `routes/progress.js`, `utils/xp.js` |
| **6** | Seed: полный контент "Базовые команды" | `seed.js` |
| **7** | Frontend: LessonView, TaskChecklist, ReportForm, XPAnimation | `components/lesson/*`, `components/gamification/*` |
| **8** | Frontend: SkillMap, ActivityHeatmap, RadarChart, Dashboard | `components/progress/*`, `Dashboard.jsx` |
| **9** | Геймификация: новые достижения, гибкий стрик, LevelBadge | `routes/achievements.js`, `utils/streak.js` |
| **10** | Контент: остальные 4 курса | `seed.js` |

---

## Порядок работы внутри каждого спринта

1. **Схема** → обновить Prisma schema → запустить миграцию
2. **Backend** → написать роут → протестировать через curl/Postman
3. **Seed** → заполнить тестовые данные → проверить в Prisma Studio
4. **Хуки** → написать React Query хук → проверить запрос в DevTools
5. **Компонент** → написать JSX → проверить в браузере (Telegram WebApp)
6. **Интеграция** → связать компонент с хуком → e2e проверка

---

## Чеклист готовности к продакшну

- [ ] Миграции применены на PostgreSQL (не SQLite)
- [ ] Seed запущен с полным контентом всех 5 курсов
- [ ] Все новые роуты покрыты auth middleware
- [ ] XP не начисляется дважды за один урок (проверить unique constraint)
- [ ] Стрик обновляется по дате, а не по запросу (учесть таймзону пользователя)
- [ ] ActivityHeatmap корректно работает при 0 активности
- [ ] XPAnimation не блокирует навигацию
- [ ] SkillMap рендерится при отсутствии данных (empty state)
