/**
 * Человекочитаемые названия навыков по ключу (совпадают с backend/src/seed-skills.js).
 * Используется там, где в UI попадает только skill_key (например копилка косточек).
 */
export const SKILL_TITLE_RU = {
  'intro.name': 'Имя',
  'intro.eye': 'Глазки',
  'daily.toilet': 'Туалет',
  'daily.sleep': 'Сон и режим',
  'daily.groom': 'Уход за телом',
  'social.people': 'Люди',
  'social.sounds': 'Звуки и вещи',
  'control.sit': 'Сидеть',
  'control.down': 'Лежать',
  'control.wait': 'Ждать',
  'control.place': 'Место',
  'walk.recall': 'Подзыв (база)',
  'walk.loose': 'Не тянуть',
  'walk.heel': 'Рядом',
  'walk.recall2': 'Подзыв (улица)',
  'walk.drop': 'Не подбирать',
  'bound.bite': 'Кусание',
  'bound.no': 'Фу / Нельзя',
  'bound.bark': 'Лай',
  'self.alone': 'Одиночество',
  'self.tired': 'Утомить',
  /** частые короткие ключи из тестов/старых данных */
  sit: 'Сидеть',
  down: 'Лежать',
  recall: 'Подзыв',
};

export function skillTitleRu(skillKey) {
  if (skillKey == null || skillKey === '') return '';
  const k = String(skillKey);
  return SKILL_TITLE_RU[k] ?? k;
}
