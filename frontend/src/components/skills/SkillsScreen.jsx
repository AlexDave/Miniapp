import { Box, VStack, HStack, Text, Progress, Badge, Button, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronDown, Lock } from 'lucide-react';
import { useUserStats } from '../../hooks/useProgress';

const MotionBox = motion(Box);

const SKILL_LABELS = {
  focus: 'Фокус',
  sit: 'Сидеть',
  recall: 'Ко мне',
};

/** Цепочка как в дизайн-доке: Фокус → Сидеть → Ко мне */
const TREE_ORDER = ['focus', 'sit', 'recall'];

function unlockHint(key, skills) {
  if (key === 'focus') return null;
  if (key === 'sit' && (skills.focus ?? 0) < 15) return 'Разблокируй через Фокус (~15%)';
  if (key === 'recall' && (skills.sit ?? 0) < 15) return 'Разблокируй через Сидеть (~15%)';
  return null;
}

function nodeStatus(key, skills, index) {
  const pct = skills[key] ?? 0;
  const locked =
    (key === 'sit' && (skills.focus ?? 0) < 10) ||
    (key === 'recall' && (skills.sit ?? 0) < 10);
  if (locked) return 'locked';
  if (pct >= 95) return 'completed';
  if (pct > 0) return 'active';
  return index === 0 ? 'active' : 'available';
}

export default function SkillsScreen() {
  const { data: stats, isLoading } = useUserStats();
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.600', 'gray.400');

  const skills = stats?.skills ?? { focus: 0, recall: 0, sit: 0 };

  if (isLoading) {
    return (
      <Box px={2} py={6}>
        <Box h="200px" bg="gray.100" borderRadius="xl" animation="pulse 1.5s ease-in-out infinite" />
      </Box>
    );
  }

  return (
    <Box pb={24} px={2}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Навыки
          </Text>
          <Text fontSize="sm" color={muted} mt={1}>
            Прогресс по навыкам, а не только по «дням»
          </Text>
        </Box>

        <VStack spacing={0} align="stretch">
          {TREE_ORDER.map((key, index) => {
            const label = SKILL_LABELS[key];
            const pct = Math.round(skills[key] ?? 0);
            const status = nodeStatus(key, skills, index);
            const locked = status === 'locked';

            return (
              <Box key={key}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <MotionBox
                    p={4}
                    bg={bg}
                    border="1px solid"
                    borderColor={locked ? 'gray.300' : border}
                    borderRadius="xl"
                    opacity={locked ? 0.65 : 1}
                    whileHover={locked ? undefined : { scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HStack justify="space-between" mb={2}>
                      <HStack spacing={3}>
                        <Text fontSize="2xl" aria-hidden>
                          {status === 'completed' ? '🟢' : status === 'locked' ? '🔒' : '🟡'}
                        </Text>
                        <Box>
                          <Text fontWeight="semibold">{label}</Text>
                          <Text fontSize="xs" color={muted}>
                            {locked ? unlockHint(key, skills) || 'Продолжай тренировки' : `${pct}%`}
                          </Text>
                        </Box>
                      </HStack>
                      {!locked && (
                        <Badge colorScheme={pct >= 95 ? 'green' : 'purple'} variant="subtle">
                          {pct}%
                        </Badge>
                      )}
                    </HStack>
                    {!locked && (
                      <Progress
                        value={pct}
                        colorScheme={status === 'completed' ? 'green' : 'purple'}
                        size="sm"
                        borderRadius="full"
                      />
                    )}
                  </MotionBox>
                </motion.div>

                {index < TREE_ORDER.length - 1 && (
                  <HStack justify="center" py={1}>
                    <ChevronDown size={22} color="#a78bfa" />
                  </HStack>
                )}
              </Box>
            );
          })}
        </VStack>

        <Box p={4} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
          <HStack spacing={2} mb={2}>
            <Lock size={16} />
            <Text fontSize="sm" fontWeight="medium">
              Совет
            </Text>
          </HStack>
          <Text fontSize="sm" color={muted}>
            Заблокированный узел откроется по росту предыдущего навыка. Заходи в «Тренировка» каждый день.
          </Text>
        </Box>

        <Button as={RouterLink} to="/train" colorScheme="purple" size="lg" borderRadius="xl">
          Перейти к тренировке
        </Button>
      </VStack>
    </Box>
  );
}
