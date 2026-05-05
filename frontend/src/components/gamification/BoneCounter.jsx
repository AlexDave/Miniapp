import { useEffect, useRef } from 'react';
import { Box, HStack, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { skillTitleRu } from '../../constants/skillLabels';

const MotionBox = motion(Box);

export default function BoneCounter({ total = 0, bySkill = {}, stage = 'Знакомство', compact = false }) {
  const bg = useColorModeValue('purple.50', 'gray.700');
  const border = useColorModeValue('purple.100', 'purple.800');
  const muted = useColorModeValue('gray.600', 'gray.400');

  if (compact) {
    return (
      <HStack spacing={1}>
        <Text fontSize="md" aria-label="Косточки">🦴</Text>
        <Text fontSize="sm" fontWeight="bold" color="purple.600">{total}</Text>
        <Text fontSize="xs" color={muted}>{stage}</Text>
      </HStack>
    );
  }

  return (
    <Box p={3} bg={bg} borderRadius="xl" border="1px solid" borderColor={border}>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2}>
          <Text fontSize="xl" aria-hidden>🦴</Text>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="bold" color="purple.700">Копилка</Text>
            <Text fontSize="xs" color={muted}>Стадия: {stage}</Text>
          </VStack>
        </HStack>
        <Text fontSize="xl" fontWeight="extrabold" color="purple.600">{total}</Text>
      </HStack>

      {Object.keys(bySkill).length > 0 && (
        <HStack spacing={2} flexWrap="wrap" mt={1}>
          {Object.entries(bySkill).map(([skill, count]) => (
            <HStack key={skill} spacing={0.5} bg="white" borderRadius="full" px={2} py={0.5} border="1px solid" borderColor="purple.100">
              <Text fontSize="xs" color="purple.700" fontWeight="medium">{skillTitleRu(skill)}</Text>
              <Text fontSize="xs" color="purple.500">×{count}</Text>
            </HStack>
          ))}
        </HStack>
      )}
    </Box>
  );
}

// Анимация падающей косточки — используется на Итоге урока
export function BoneDropAnimation({ show, count = 1, isSpecial = false, onDone }) {
  const reduce = useReducedMotion();
  const label = `+${count} ${isSpecial ? 'особая косточка' : 'косточка'}`;
  const prevShow = useRef(show);

  useEffect(() => {
    if (!reduce || typeof onDone !== 'function') return;
    if (prevShow.current && !show) {
      onDone();
    }
    prevShow.current = show;
  }, [show, reduce, onDone]);

  if (reduce) {
    return show ? (
      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        position="fixed"
        top="30%"
        left="50%"
        transform="translateX(-50%)"
        zIndex={1000}
        textAlign="center"
        pointerEvents="none"
      >
        <VStack spacing={1}>
          <Text fontSize="5xl" lineHeight="1" aria-hidden>
            {isSpecial ? '⭐' : '🦴'}
          </Text>
          <Text fontSize="xl" fontWeight="extrabold" color="purple.600">
            {label}
          </Text>
        </VStack>
      </Box>
    ) : null;
  }

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <MotionBox
          role="status"
          aria-live="polite"
          aria-atomic="true"
          position="fixed"
          top="30%"
          left="50%"
          translateX="-50%"
          zIndex={1000}
          textAlign="center"
          initial={{ opacity: 0, y: -60, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          pointerEvents="none"
        >
          <VStack spacing={1}>
            <Text fontSize="5xl" lineHeight="1" aria-hidden>
              {isSpecial ? '⭐' : '🦴'}
            </Text>
            <Text fontSize="xl" fontWeight="extrabold" color="purple.600">
              {label}
            </Text>
          </VStack>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
