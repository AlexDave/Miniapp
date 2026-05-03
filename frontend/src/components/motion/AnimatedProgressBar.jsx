import { Box } from '@chakra-ui/react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { MOTION, sec } from '../../motion/tokens';

const MotionBox = motion(Box);

/**
 * @param {number} value — целевая доля 0–100
 * @param {number} from — стартовая доля
 * @param {number} delay — задержка в секундах перед анимацией
 * @param {number} duration — длительность в ms
 */
export default function AnimatedProgressBar({
  value = 0,
  from = 0,
  delay = 0,
  duration = MOTION.duration.slow,
  barColor = 'green.400',
  trackColor = 'gray.100',
  height = '8px',
  borderRadius = 'full',
}) {
  const mv = useMotionValue(from);
  const widthPct = useTransform(mv, (v) => `${Math.min(100, Math.max(0, v))}%`);

  useEffect(() => {
    mv.set(from);
    const controls = animate(mv, Math.min(100, value), {
      delay,
      duration: sec(duration),
      ease: MOTION.easing.default,
    });
    return () => controls.stop();
  }, [value, from, delay, duration, mv]);

  return (
    <Box
      w="100%"
      h={height}
      bg={trackColor}
      borderRadius={borderRadius}
      overflow="hidden"
      position="relative"
    >
      <MotionBox
        h="full"
        bg={barColor}
        borderRadius="inherit"
        style={{ width: widthPct }}
      />
    </Box>
  );
}
