import { AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

/**
 * При prefers-reduced-motion не оборачивает в AnimatePresence (без exit-анимаций и layout-сдвигов).
 */
export default function ReducedMotionAnimatePresence({ children, ...props }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <>{children}</>;
  }
  return <AnimatePresence {...props}>{children}</AnimatePresence>;
}
