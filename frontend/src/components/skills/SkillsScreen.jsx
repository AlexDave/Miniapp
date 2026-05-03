import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Button,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronDown, Lock } from 'lucide-react';
import { useUserStats } from '../../hooks/useProgress';
import { useLessonsBySkill } from '../../hooks/useLessons';

const MotionBox = motion(Box);

const SKILL_LABELS = {
  focus: 'Фокус',
  sit: 'Сидеть',
  recall: 'Ко мне',
};

const SKILL_INFO = {
  focus: {
    emoji: '🎯',
    description:
      'Контакт с хозяином и устойчивое внимание — фундамент для всех остальных команд.',
    helps_with: [
      'Собака отвлекается на улице на людей и других животных',
      'Сложно вернуть внимание после игры или прогулки',
      'Не реагирует на имя в новом месте',
    ],
  },
  sit: {
    emoji: '🐕',
    description:
      'Базовая позиция: пауза перед действием. От «сидеть» строятся выдержка, ожидание у двери, спокойная встреча гостей.',
    helps_with: [
      'Прыгает на хозяина и гостей при встрече',
      'Тянет к миске, не дожидаясь команды',
      'Не может спокойно подождать на переходе',
    ],
  },
  recall: {
    emoji: '🏃',
    description:
      'Надёжный подзыв. Самый важный навык безопасности на улице и в общественных местах.',
    helps_with: [
      'Не подходит, когда зовёшь, особенно с площадки',
      'Убегает за другими собаками или людьми',
      'Игнорирует кличку при отвлечениях',
    ],
  },
};

/** Цепочка как в дизайн-доке: Фокус → Сидеть → Ко мне */
const TREE_ORDER = ['focus', 'sit', 'recall'];

const STATUS_ICONS = {
  completed: '✅',
  current: '▶️',
  available: '⚪',
  locked: '🔒',
};

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

function SkillLessonsList({ skillKey, locked }) {
  const { data, isLoading } = useLessonsBySkill(skillKey);
  const muted = useColorModeValue('gray.600', 'gray.400');
  const rowBg = useColorModeValue('gray.50', 'gray.700');
  const rowBorder = useColorModeValue('gray.100', 'gray.600');
  const rowHover = useColorModeValue('purple.50', 'gray.600');

  if (isLoading) {
    return (
      <VStack align="stretch" spacing={2}>
        <Skeleton height="40px" borderRadius="md" />
        <Skeleton height="40px" borderRadius="md" />
      </VStack>
    );
  }

  const lessons = data?.lessons ?? [];

  if (lessons.length === 0) {
    return (
      <Text fontSize="sm" color={muted}>
        Скоро добавим уроки по этому навыку.
      </Text>
    );
  }

  return (
    <VStack align="stretch" spacing={2}>
      {lessons.map((lesson) => {
        const isClickable = !locked;
        const icon = STATUS_ICONS[lesson.status] ?? '⚪';

        const content = (
          <HStack
            spacing={3}
            p={2.5}
            bg={rowBg}
            border="1px solid"
            borderColor={rowBorder}
            borderRadius="md"
            opacity={locked ? 0.55 : 1}
            _hover={isClickable ? { bg: rowHover } : undefined}
            transition="background 0.15s"
          >
            <Text fontSize="md" aria-hidden>
              {locked ? '🔒' : icon}
            </Text>
            <Box flex="1" minW={0}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {lesson.title}
              </Text>
              {lesson.course?.title && (
                <Text fontSize="xs" color={muted} noOfLines={1}>
                  {lesson.course.title}
                </Text>
              )}
            </Box>
            {lesson.status === 'current' && !locked && (
              <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                Сейчас
              </Badge>
            )}
          </HStack>
        );

        if (!isClickable) {
          return <Box key={lesson.id}>{content}</Box>;
        }

        return (
          <Box
            key={lesson.id}
            as={RouterLink}
            to={`/lesson/${lesson.id}`}
            _hover={{ textDecoration: 'none' }}
          >
            {content}
          </Box>
        );
      })}
    </VStack>
  );
}

function SkillDetail({ skillKey, locked, skills }) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  const detailBg = useColorModeValue('gray.50', 'gray.900');
  const detailBorder = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  const lockBg = useColorModeValue('orange.50', 'orange.900');
  const lockBorder = useColorModeValue('orange.100', 'orange.700');
  const lockText = useColorModeValue('orange.800', 'orange.200');

  const info = SKILL_INFO[skillKey];
  const lockHint = locked ? unlockHint(skillKey, skills) : null;

  return (
    <Box
      mt={2}
      p={4}
      bg={detailBg}
      borderRadius="xl"
      border="1px dashed"
      borderColor={detailBorder}
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Text fontSize="md" aria-hidden>
              {info.emoji}
            </Text>
            <Text fontSize="xs" fontWeight="bold" color={headingColor} textTransform="uppercase" letterSpacing="wide">
              Что это
            </Text>
          </HStack>
          <Text fontSize="sm" color={muted}>
            {info.description}
          </Text>
        </Box>

        <Box>
          <Text fontSize="xs" fontWeight="bold" color={headingColor} textTransform="uppercase" letterSpacing="wide" mb={2}>
            Когда поможет
          </Text>
          <VStack align="stretch" spacing={1.5}>
            {info.helps_with.map((item) => (
              <HStack key={item} align="flex-start" spacing={2}>
                <Text color="purple.400" fontSize="sm" lineHeight="1.5">
                  •
                </Text>
                <Text fontSize="sm" color={muted} lineHeight="1.5">
                  {item}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {lockHint && (
          <Box
            p={2.5}
            bg={lockBg}
            borderRadius="md"
            border="1px solid"
            borderColor={lockBorder}
          >
            <HStack spacing={2}>
              <Lock size={14} />
              <Text fontSize="xs" color={lockText}>
                {lockHint}
              </Text>
            </HStack>
          </Box>
        )}

        <Box>
          <Text fontSize="xs" fontWeight="bold" color={headingColor} textTransform="uppercase" letterSpacing="wide" mb={2}>
            Уроки навыка
          </Text>
          <SkillLessonsList skillKey={skillKey} locked={locked} />
        </Box>
      </VStack>
    </Box>
  );
}

export default function SkillsScreen() {
  const { data: stats, isLoading } = useUserStats();
  const [expandedKey, setExpandedKey] = useState(null);

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
            const isExpanded = expandedKey === key;

            const handleToggle = () => {
              setExpandedKey(isExpanded ? null : key);
            };

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
                    cursor="pointer"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`Подробнее о навыке «${label}»`}
                    onClick={handleToggle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggle();
                      }
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
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
                      <HStack spacing={2}>
                        {!locked && (
                          <Badge colorScheme={pct >= 95 ? 'green' : 'purple'} variant="subtle">
                            {pct}%
                          </Badge>
                        )}
                        <MotionBox
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          display="flex"
                          alignItems="center"
                          color={muted}
                        >
                          <ChevronDown size={20} />
                        </MotionBox>
                      </HStack>
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

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <MotionBox
                      key="detail"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      overflow="hidden"
                    >
                      <SkillDetail skillKey={key} locked={locked} skills={skills} />
                    </MotionBox>
                  )}
                </AnimatePresence>

                {index < TREE_ORDER.length - 1 && !isExpanded && (
                  <HStack justify="center" py={1}>
                    <ChevronDown size={22} color="#a78bfa" />
                  </HStack>
                )}
                {index < TREE_ORDER.length - 1 && isExpanded && <Box h={2} />}
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
