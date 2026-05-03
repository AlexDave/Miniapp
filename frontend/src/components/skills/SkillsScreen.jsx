import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  Progress,
  Badge,
  IconButton,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Lock, Info } from 'lucide-react';
import { useSkillTree, useLessonsForSkill } from '../../hooks/useSkillTree';

const MotionBox = motion(Box);

const STATUS_ICONS = {
  completed: '✅',
  current: '▶️',
  available: '⚪',
};

// ─── Category card in the grid ───────────────────────────────────────────────

function CategoryCard({ category, onClick }) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const pct = category.progress_pct ?? 0;
  const isDone = pct >= 100;

  return (
    <MotionBox
      as="button"
      w="100%"
      textAlign="left"
      p={4}
      bg={bg}
      border="1px solid"
      borderColor={isDone ? 'green.300' : border}
      borderRadius="2xl"
      cursor="pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18 }}
      aria-label={`Открыть категорию «${category.title}»`}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="2xl" aria-hidden>{category.icon ?? '🐾'}</Text>
          {isDone && <Badge colorScheme="green" variant="subtle" fontSize="xs">Готово</Badge>}
        </HStack>
        <Box>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{category.title}</Text>
          <Text fontSize="xs" color={muted} noOfLines={2} mt={0.5}>{category.description}</Text>
        </Box>
        <Box>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="xs" color={muted}>{pct}%</Text>
            <Text fontSize="xs" color={muted}>{category.skills?.length ?? 0} навыков</Text>
          </HStack>
          <Progress
            value={pct}
            colorScheme={isDone ? 'green' : 'purple'}
            size="xs"
            borderRadius="full"
          />
        </Box>
      </VStack>
    </MotionBox>
  );
}

// ─── Lessons list inside an atom detail ──────────────────────────────────────

function AtomLessons({ skillKey }) {
  const { data, isLoading } = useLessonsForSkill(skillKey);
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
      <Text fontSize="sm" color={muted}>Уроки скоро появятся.</Text>
    );
  }

  return (
    <VStack align="stretch" spacing={2}>
      {lessons.map((lesson) => {
        const icon = STATUS_ICONS[lesson.status] ?? '⚪';
        const row = (
          <HStack
            spacing={3}
            p={2.5}
            bg={rowBg}
            border="1px solid"
            borderColor={rowBorder}
            borderRadius="md"
            _hover={{ bg: rowHover }}
            transition="background 0.15s"
          >
            <Text fontSize="md" aria-hidden>{icon}</Text>
            <Box flex="1" minW={0}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>{lesson.title}</Text>
              {lesson.course?.title && (
                <Text fontSize="xs" color={muted} noOfLines={1}>{lesson.course.title}</Text>
              )}
            </Box>
            <HStack spacing={1}>
              {lesson.repeats_count > 0 && (
                <Badge colorScheme="gray" variant="subtle" fontSize="xs">×{lesson.repeats_count}</Badge>
              )}
              {lesson.status === 'current' && (
                <Badge colorScheme="purple" variant="subtle" fontSize="xs">Сейчас</Badge>
              )}
            </HStack>
          </HStack>
        );

        return (
          <Box key={lesson.id} as={RouterLink} to={`/lesson/${lesson.id}`} _hover={{ textDecoration: 'none' }}>
            {row}
          </Box>
        );
      })}
    </VStack>
  );
}

// ─── Expandable atom row ──────────────────────────────────────────────────────

function AtomRow({ skill, isExpanded, onToggle }) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.600');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const detailBg = useColorModeValue('gray.50', 'gray.900');
  const hintBg = useColorModeValue('orange.50', 'orange.900');
  const hintBorder = useColorModeValue('orange.100', 'orange.700');
  const hintText = useColorModeValue('orange.800', 'orange.200');

  const pct = skill.progress_pct ?? 0;
  const isDone = skill.is_complete;
  const bonesLabel = `${skill.bones_earned ?? 0} / ${skill.target_bones ?? 5} 🦴`;

  return (
    <Box>
      <MotionBox
        p={3.5}
        bg={bg}
        border="1px solid"
        borderColor={isDone ? 'green.200' : border}
        borderRadius="xl"
        cursor="pointer"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`Навык «${skill.title}»`}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
      >
        <HStack justify="space-between" mb={2}>
          <Box flex="1" minW={0}>
            <HStack spacing={2}>
              <Text fontWeight="semibold" fontSize="sm">{skill.title}</Text>
              {isDone && <Badge colorScheme="green" variant="subtle" fontSize="xs">Готово</Badge>}
              {skill.unlock_hint && !isDone && (
                <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                  <HStack spacing={1}><Lock size={9} /><span>Рекомендация</span></HStack>
                </Badge>
              )}
            </HStack>
            <Text fontSize="xs" color={muted} noOfLines={1} mt={0.5}>{skill.description}</Text>
          </Box>
          <HStack spacing={2} flexShrink={0}>
            <Text fontSize="xs" color={muted}>{bonesLabel}</Text>
            <MotionBox
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              display="flex"
              alignItems="center"
              color={muted}
            >
              <ChevronDown size={18} />
            </MotionBox>
          </HStack>
        </HStack>
        <Progress
          value={pct}
          colorScheme={isDone ? 'green' : 'purple'}
          size="xs"
          borderRadius="full"
        />
      </MotionBox>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <MotionBox
            key="atom-detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            overflow="hidden"
          >
            <Box mt={1.5} p={4} bg={detailBg} borderRadius="xl" border="1px dashed" borderColor={border}>
              <VStack align="stretch" spacing={3}>
                {skill.unlock_hint && (
                  <Box p={2.5} bg={hintBg} borderRadius="md" border="1px solid" borderColor={hintBorder}>
                    <HStack spacing={2}>
                      <Info size={13} />
                      <Text fontSize="xs" color={hintText}>{skill.unlock_hint}</Text>
                    </HStack>
                  </Box>
                )}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={muted} mb={2}>
                    Уроки навыка
                  </Text>
                  <AtomLessons skillKey={skill.key} />
                </Box>
              </VStack>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}

// ─── Category detail view ─────────────────────────────────────────────────────

function CategoryDetail({ category, onBack }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const muted = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');

  const toggle = (key) => setExpandedKey((prev) => (prev === key ? null : key));

  return (
    <Box pb={24}>
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        bg={headerBg}
        pb={3}
        pt={1}
      >
        <HStack spacing={3}>
          <IconButton
            icon={<ChevronLeft size={20} />}
            variant="ghost"
            size="sm"
            aria-label="Назад к категориям"
            onClick={onBack}
          />
          <HStack spacing={2}>
            <Text fontSize="xl" aria-hidden>{category.icon ?? '🐾'}</Text>
            <Box>
              <Text fontWeight="bold" fontSize="md">{category.title}</Text>
              <Text fontSize="xs" color={muted}>{category.description}</Text>
            </Box>
          </HStack>
        </HStack>
        <Box mt={3}>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="xs" color={muted}>Общий прогресс</Text>
            <Text fontSize="xs" color={muted}>{category.progress_pct ?? 0}%</Text>
          </HStack>
          <Progress
            value={category.progress_pct ?? 0}
            colorScheme={(category.progress_pct ?? 0) >= 100 ? 'green' : 'purple'}
            size="sm"
            borderRadius="full"
          />
        </Box>
      </Box>

      <VStack spacing={2.5} align="stretch" mt={4}>
        {(category.skills ?? []).map((skill, i) => (
          <motion.div
            key={skill.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <AtomRow
              skill={skill}
              isExpanded={expandedKey === skill.key}
              onToggle={() => toggle(skill.key)}
            />
          </motion.div>
        ))}
      </VStack>
    </Box>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SkillsScreen() {
  const { data: tree, isLoading } = useSkillTree();
  const [activeCategory, setActiveCategory] = useState(null);
  const muted = useColorModeValue('gray.600', 'gray.400');

  if (isLoading) {
    return (
      <Box px={2} py={6}>
        <SimpleGrid columns={2} spacing={3}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="130px" borderRadius="2xl" />
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  const categories = tree ?? [];

  if (activeCategory) {
    const cat = categories.find((c) => c.key === activeCategory);
    if (cat) {
      return (
        <Box px={2} py={2}>
          <CategoryDetail category={cat} onBack={() => setActiveCategory(null)} />
        </Box>
      );
    }
  }

  return (
    <Box pb={24} px={2}>
      <VStack spacing={5} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="bold">Навыки</Text>
          <Text fontSize="sm" color={muted} mt={1}>
            Прогресс по атомарным навыкам
          </Text>
        </Box>

        <SimpleGrid columns={2} spacing={3}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <CategoryCard
                category={cat}
                onClick={() => setActiveCategory(cat.key)}
              />
            </motion.div>
          ))}
        </SimpleGrid>

        {categories.length === 0 && (
          <Box textAlign="center" py={12}>
            <Text fontSize="3xl" mb={3}>🐾</Text>
            <Text color={muted}>Дерево навыков загружается...</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
