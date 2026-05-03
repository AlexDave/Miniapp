const SKILL_CATEGORIES = [
  { key: 'intro',      title: 'Знакомство',       description: 'Первый контакт и базовое внимание',      icon: '🐾', order_index: 0 },
  { key: 'daily',      title: 'Быт',               description: 'Режим, туалет, уход за телом',           icon: '🏠', order_index: 1 },
  { key: 'social',     title: 'Социализация',      description: 'Люди, звуки, новые места',               icon: '🌍', order_index: 2 },
  { key: 'control',    title: 'Контроль',           description: 'Базовые команды управления',             icon: '✋', order_index: 3 },
  { key: 'walk',       title: 'Прогулка',           description: 'Поводок, подзыв, безопасность',          icon: '🦮', order_index: 4 },
  { key: 'boundaries', title: 'Границы',            description: 'Кусание, запреты, лай',                  icon: '🚫', order_index: 5 },
  { key: 'self',       title: 'Самостоятельность',  description: 'Одиночество и утомление',                icon: '🧘', order_index: 6 },
];

const SKILLS = [
  // Знакомство
  { key: 'intro.name',  category_key: 'intro',   title: 'Имя',            description: 'Реакция на кличку как сигнал «обрати внимание»',   order_index: 0, target_bones: 5, unlock_rules: null },
  { key: 'intro.eye',   category_key: 'intro',   title: 'Глазки',         description: 'Зрительный контакт — фундамент послушания',        order_index: 1, target_bones: 5, unlock_rules: null },

  // Быт
  { key: 'daily.toilet', category_key: 'daily',  title: 'Туалет',         description: 'Цикл туалета: выход по триггеру',                  order_index: 0, target_bones: 5, unlock_rules: null },
  { key: 'daily.sleep',  category_key: 'daily',  title: 'Сон и режим',    description: 'Режим сна, тихое место для отдыха',                order_index: 1, target_bones: 4, unlock_rules: null },
  { key: 'daily.groom',  category_key: 'daily',  title: 'Уход за телом',  description: 'Когти, уши, глаза, зубы',                         order_index: 2, target_bones: 4, unlock_rules: null },

  // Социализация
  { key: 'social.people', category_key: 'social', title: 'Люди',           description: 'Знакомство с разными людьми до 4 мес',             order_index: 0, target_bones: 5, unlock_rules: null },
  { key: 'social.sounds', category_key: 'social', title: 'Звуки и вещи',  description: 'Пылесос, шуба, велосипед — без тревоги',          order_index: 1, target_bones: 5, unlock_rules: null },

  // Контроль
  { key: 'control.sit',   category_key: 'control', title: 'Сидеть',        description: 'Пауза перед действием',                           order_index: 0, target_bones: 6, unlock_rules: JSON.stringify({ soft: [{ skill: 'intro.eye', min: 2 }] }) },
  { key: 'control.down',  category_key: 'control', title: 'Лежать',        description: 'Выдержка и спокойствие',                          order_index: 1, target_bones: 6, unlock_rules: JSON.stringify({ soft: [{ skill: 'control.sit', min: 2 }] }) },
  { key: 'control.wait',  category_key: 'control', title: 'Ждать',         description: 'Безопасность у двери, миски, перехода',           order_index: 2, target_bones: 6, unlock_rules: JSON.stringify({ soft: [{ skill: 'control.sit', min: 3 }] }) },
  { key: 'control.place', category_key: 'control', title: 'Место',         description: '«Домик» — сигнал отдыха и спокойствия',           order_index: 3, target_bones: 5, unlock_rules: JSON.stringify({ soft: [{ skill: 'control.down', min: 2 }] }) },

  // Прогулка
  { key: 'walk.recall',   category_key: 'walk',   title: 'Подзыв (база)', description: 'Ко мне = всегда хорошо',                          order_index: 0, target_bones: 6, unlock_rules: JSON.stringify({ soft: [{ skill: 'intro.name', min: 3 }] }) },
  { key: 'walk.loose',    category_key: 'walk',   title: 'Не тянуть',     description: 'Метод стоп-и-жди',                                order_index: 1, target_bones: 6, unlock_rules: JSON.stringify({ soft: [{ skill: 'control.sit', min: 2 }] }) },
  { key: 'walk.heel',     category_key: 'walk',   title: 'Рядом',         description: 'Фокус-маркер во время ходьбы',                    order_index: 2, target_bones: 6, unlock_rules: JSON.stringify({ soft: [{ skill: 'walk.loose', min: 2 }] }) },
  { key: 'walk.recall2',  category_key: 'walk',   title: 'Подзыв (улица)',description: 'Надёжный отзыв при отвлечениях',                  order_index: 3, target_bones: 7, unlock_rules: JSON.stringify({ soft: [{ skill: 'walk.recall', min: 4 }] }) },
  { key: 'walk.drop',     category_key: 'walk',   title: 'Не подбирать',  description: 'Обмен «брось → дам лучше»',                       order_index: 4, target_bones: 5, unlock_rules: JSON.stringify({ soft: [{ skill: 'control.wait', min: 2 }] }) },

  // Границы
  { key: 'bound.bite',    category_key: 'boundaries', title: 'Кусание',    description: 'Рот = рецептор, не агрессия',                     order_index: 0, target_bones: 5, unlock_rules: null },
  { key: 'bound.no',      category_key: 'boundaries', title: 'Фу / Нельзя',description: 'Фу (навсегда) vs Нельзя (сейчас)',               order_index: 1, target_bones: 5, unlock_rules: null },
  { key: 'bound.bark',    category_key: 'boundaries', title: 'Лай',        description: 'Дневник триггеров, коррекция',                    order_index: 2, target_bones: 5, unlock_rules: null },

  // Самостоятельность
  { key: 'self.alone',    category_key: 'self',   title: 'Одиночество',   description: 'Лесенка 5→15→30 минут',                           order_index: 0, target_bones: 6, unlock_rules: JSON.stringify({ soft: [{ skill: 'bound.bark', min: 2 }] }) },
  { key: 'self.tired',    category_key: 'self',   title: 'Утомить',       description: 'Умственная > физическая нагрузка',                order_index: 1, target_bones: 4, unlock_rules: null },
];

module.exports = { SKILL_CATEGORIES, SKILLS };
