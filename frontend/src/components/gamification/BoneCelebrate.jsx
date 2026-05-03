import { Box } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Анимация «падения» косточки (spring). При prefers-reduced-motion — статика.
 */
export default function BoneCelebrate({ children }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <Box>{children}</Box>;
  }

  return (
    <motion.div
      initial={{ y: -72, opacity: 0, rotate: -12 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22, mass: 0.85 }}
    >
      {children}
    </motion.div>
  );
}
