# HANDOFF — DogCourse Miniapp Content Sprint

**Дата:** 2026-05-05  
**Статус:** ЗАВЕРШЕНО ✅ — все 35 уроков сгенерированы, засеяны в БД

---

## Что было сделано (полностью)

### 1. Контент — 35 уроков из реальных транскриптов

- **`backend/data/lessons-puppy.json`** — 19 уроков курса "Щенок первый месяц" (v2 schema)
- **`backend/data/lessons-6plus.json`** — 16 уроков курса "Послушание от 6 месяцев" (v2 schema)  
- **`backend/data/atomic-lessons.json`** — финальный файл (version: 2), собранный из обоих курсов

Каждый урок содержит:
- `why` — зачем тренировать (1-2 предложения)
- `skip_cost` — что будет, если пропустить
- `theory_blocks[]` — 3-6 блоков: `concept`, `principle`, `tip`, `warning`, `example`
- `how_steps[]` — 4-7 конкретных шагов из транскриптов
- `common_mistakes[]` — 2-4 типичные ошибки
- `success_criteria[]` — 2-3 критерия успеха
- `fallback_tasks` — объект с `easy/normal/hard` (label + description)
- `pro_tip` — совет профессионала

### 2. Backend — обновлён `seed-content.js`

**Файл:** `backend/src/seed-content.js`  
Ключевые изменения:
- Поддерживает и СТАРЫЙ (legacy: goal/task_checkboxes/xp) и НОВЫЙ (theory_blocks) форматы
- `stepsFromBlocks()` — превращает theory_blocks + how_steps + common_mistakes + pro_tip в LessonStep[]
- Маппинг типов: `concept→card`, `principle→text`, `tip→tip`, `warning→tip(⚠️)`, `example→text(📖)`
- `normalizeFallbackTasks()` — конвертирует новый объект в массив для buildFallbackTreePayload
- `buildTaskCheckboxes()` — success_criteria → DailyTask checkboxes
- `COURSE_ID_TO_TITLE` маппинг — поддержка нового course_id без course_title

### 3. Frontend — обновлён `LessonView.jsx`

**Файл:** `frontend/src/components/lesson/LessonView.jsx`  
Ключевые изменения:
- `WhyScreen` теперь принимает `skipCost` prop — показывает оранжевый блок "⚠️ Если пропустить"
- `normalizeFallbackTasksForUI()` — обрабатывает и старый (array) и новый (object) формат fallback_tasks
- Обновлён вызов `WhyScreen` → передаёт `lessonMeta.skip_cost`
- Обновлён вызов `ReportForm` → использует `normalizeFallbackTasksForUI` вместо `Array.isArray`

### 4. Скрипт сборки

**Файл:** `backend/scripts/assemble-lessons.js`  
- Читает `lessons-puppy.json` + `lessons-6plus.json`
- Исправляет skill_key по корректному маппингу (на основе реальных тем уроков)
- Добавляет course_title для совместимости
- Пишет итоговый `atomic-lessons.json`

---

## БД засеяна

```
✅ Курсов: 2
✅ Модули и уроки созданы: 35 уроков  
✅ Категорий навыков: 7, атомов: 21
✅ Маршрутов: 4
✅ Достижений: 10
```

БД обновлена в ОБОИХ местах:
- `D:/Project/Miniapp/backend/prisma/dev.db` (основная)
- `D:/Project/Miniapp/.claude/worktrees/charming-rubin-c2a3e5/backend/prisma/dev.db`

---

## Что осталось (если нужно)

### Опционально — улучшения UI
1. Коммит изменений в git (если worktree нужно влить)
2. Обновить `PLAN.md` — добавить запись о Content Sprint
3. Обновить `memory/project_dogcourse.md` — текущий статус
4. Проверить вёрстку через `npm run dev` (backend + frontend)

### Карта skill_key (для справки)
```
Щенок:   1=intro.name, 2=daily.sleep, 3=daily.sleep, 4=daily.toilet, 5=daily.toilet
          6=bound.no, 7=daily.groom, 8=daily.groom, 9=bound.no, 10=intro.eye
          11=bound.bark, 12=self.alone, 13=daily.sleep, 14=social.sounds, 15=control.sit
          16=intro.name, 17=bound.bite, 18=social.people, 19=self.tired

От 6 мес: 1=intro.name, 2=self.tired, 3=control.sit, 4=control.down, 5=intro.eye
           6=walk.recall, 7=walk.heel, 8=control.wait, 9=bound.no, 10=control.place
           11=intro.eye, 12=walk.recall2, 13=walk.loose, 14=self.alone
           15=walk.drop, 16=bound.bark
```

---

## Файлы изменены

| Файл | Статус |
|------|--------|
| `backend/data/atomic-lessons.json` | ПЕРЕЗАПИСАН (v2, 35 уроков) |
| `backend/data/lessons-puppy.json` | СОЗДАН (19 уроков щенок) |
| `backend/data/lessons-6plus.json` | СОЗДАН (16 уроков от-6-мес) |
| `backend/src/seed-content.js` | ОБНОВЛЁН (dual-format support) |
| `backend/scripts/assemble-lessons.js` | СОЗДАН |
| `frontend/src/components/lesson/LessonView.jsx` | ОБНОВЛЁН (skip_cost + new fallback format) |
