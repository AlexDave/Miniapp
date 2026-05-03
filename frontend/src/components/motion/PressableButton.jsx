import { Button, Box } from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import { MOTION } from '../../motion/tokens';

const MotionWrap = motion(Box);

/**
 * Физическое нажатие 0.96; опционально «успешный» bounce.
 */
export default function PressableButton({
  children,
  successTap = false,
  fullWidth,
  ...props
}) {
  const reduce = useReducedMotion();
  const tap = successTap
    ? {
        scale: [1, MOTION.scale.pop, 1],
        transition: { duration: 0.2, ease: MOTION.easing.bounce },
      }
    : { scale: MOTION.scale.press };

  if (reduce) {
    return (
      <Box w={fullWidth ? '100%' : 'auto'} display={fullWidth ? 'block' : 'inline-block'}>
        <Button w={fullWidth ? '100%' : undefined} {...props}>
          {children}
        </Button>
      </Box>
    );
  }

  return (
    <MotionWrap
      w={fullWidth ? '100%' : 'auto'}
      display={fullWidth ? 'block' : 'inline-block'}
      whileTap={tap}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15, ease: MOTION.easing.default }}
    >
      <Button w={fullWidth ? '100%' : undefined} {...props}>
        {children}
      </Button>
    </MotionWrap>
  );
}
