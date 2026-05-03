import { MOTION, sec } from './tokens';

const ease = MOTION.easing.default;
const easeOut = MOTION.easing.out;
const bounce = MOTION.easing.bounce;

export const transition = {
  fast: { duration: sec(MOTION.duration.fast), ease: ease },
  normal: { duration: sec(MOTION.duration.normal), ease: ease },
  slow: { duration: sec(MOTION.duration.slow), ease: ease },
  out: { duration: sec(MOTION.duration.normal), ease: easeOut },
  spring: { type: 'spring', stiffness: 400, damping: 22 },
  springSoft: { type: 'spring', stiffness: 300, damping: 20 },
};

/** Кнопка: нажатие */
export const tap = {
  rest: { scale: 1 },
  tap: { scale: MOTION.scale.press, transition: transition.fast },
};

/** Успешный тап (микро-bounce) */
export const successTap = {
  rest: { scale: 1 },
  tap: { scale: [1, MOTION.scale.pop, 1], transition: { duration: sec(200), ease: bounce } },
};

export const stepExit = {
  opacity: 0,
  x: -20,
  transition: { duration: sec(MOTION.duration.normal), ease: ease },
};

export const stepEnter = {
  opacity: 0,
  x: 20,
};

export const stepEnterDone = {
  opacity: 1,
  x: 0,
  transition: { duration: sec(MOTION.duration.normal), ease: ease },
};

/** Мягкий shake (fail) */
export const shake = {
  x: [0, -5, 5, -3, 0],
  transition: { duration: sec(0.45), ease: easeOut },
};

export const floatXPGain = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [10, 0, -20, -28],
    transition: {
      duration: sec(MOTION.duration.xpFloat),
      times: [0, 0.12, 0.75, 1],
      ease: ease,
    },
  },
};

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: sec(MOTION.duration.normal) },
};

export const modalCard = {
  initial: { scale: 0.85, opacity: 0, y: 24 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: transition.springSoft,
  },
};

export const heroPop = {
  initial: { scale: 0.85 },
  animate: {
    scale: [0.85, 1.08, 1],
    transition: { duration: sec(0.45), ease: bounce },
  },
};

export const streakFire = {
  animate: {
    scale: [1, 1.15, 1],
    rotate: [0, -4, 4, 0],
    transition: {
      duration: sec(0.55),
      ease: ease,
    },
  },
};

export const badgeUnlock = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.15, 1],
    opacity: 1,
    transition: { duration: sec(0.55), ease: bounce },
  },
};

export const idleBreath = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
