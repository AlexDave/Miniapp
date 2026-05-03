/** Совпадает с категориями курсов в БД (seed из courses.json). */
export const CATEGORY_PUPPY = 'Щенок';
export const CATEGORY_ADULT = 'От 6 месяцев';

export const DOG_AGE_OPTIONS = [
  { value: 'under6mo', label: 'До 6 месяцев' },
  { value: '6mo_2y', label: 'От 6 месяцев до 2 лет' },
  { value: 'older', label: 'Старше 2 лет' },
];

/** id → подпись для чипов целей */
export const LEARNING_GOALS = [
  { id: 'commands', label: 'Базовые команды' },
  { id: 'potty', label: 'Туалет и адаптация дома' },
  { id: 'walk', label: 'Спокойная прогулка без рывков' },
  { id: 'bark', label: 'Лай и возбуждение' },
  { id: 'social', label: 'Социализация' },
  { id: 'other', label: 'Другое' },
];

export const PRIMARY_PROBLEM_OPTIONS = [
  { value: '', label: 'Пропустить' },
  { value: 'pulls', label: 'Тянет поводок' },
  { value: 'barking', label: 'Лает / скулит' },
  { value: 'toilet', label: 'Туалет дома' },
  { value: 'biting', label: 'Кусается / играет зубами' },
  { value: 'anxiety', label: 'Тревога / страх' },
  { value: 'other', label: 'Другое (опишу позже)' },
];

/**
 * Делит курсы на «под возраст» и остальные; featured — первый подходящий.
 */
export function formatPrimaryProblem(value) {
  if (value == null || value === '') return null;
  const o = PRIMARY_PROBLEM_OPTIONS.find((x) => x.value === value);
  return o?.label ?? String(value);
}

export function partitionCoursesByAge(courses, dogAgeBucket) {
  const list = Array.isArray(courses) ? [...courses] : [];
  const primaryCategory =
    dogAgeBucket === 'under6mo' ? CATEGORY_PUPPY : CATEGORY_ADULT;

  const primary = list.filter((c) => c.category === primaryCategory);
  const rest = list.filter((c) => c.category !== primaryCategory);
  const featured = primary[0] ?? list[0] ?? null;

  return { primary, rest, featured, primaryCategory };
}
