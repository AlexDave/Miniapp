/** Ключ в `location.state` для подсветки нижней панели на экране `/lesson/:id`. */
export const BOTTOM_TAB_STATE_KEY = 'bottomTab';

const TABS = ['/', '/skills', '/library', '/profile'];

/** `state` для `navigate` / `RouterLink` при открытии урока с нужной вкладки. */
export function lessonNavState(tabPath) {
  return { [BOTTOM_TAB_STATE_KEY]: tabPath };
}

/** Пробросить вкладку на ссылку «следующий урок» (или `undefined`, если не задано). */
export function forwardLessonTabState(routerState) {
  const t = routerState?.[BOTTOM_TAB_STATE_KEY];
  if (TABS.includes(t)) return { [BOTTOM_TAB_STATE_KEY]: t };
  return undefined;
}
