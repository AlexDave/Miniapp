/**
 * Motion system — длительности (ms), кривые, масштаб.
 * @see motion/variants.js
 */
export const MOTION = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    xpFloat: 600,
    levelUp: 800,
    badge: 700,
  },
  /** Framer Motion: [x1, y1, x2, y2] */
  easing: {
    default: [0.2, 0.8, 0.2, 1],
    bounce: [0.34, 1.56, 0.64, 1],
    out: [0, 0, 0.2, 1],
  },
  scale: {
    press: 0.96,
    pop: 1.05,
  },
};

export const sec = (ms) => ms / 1000;
