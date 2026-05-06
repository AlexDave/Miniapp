import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Text,
  Progress,
  Badge,
  IconButton,
  Skeleton,
  Button,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import ReducedMotionAnimatePresence from '../../motion/ReducedMotionAnimatePresence';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { lessonNavState } from '../../constants/bottomNav';
import { ChevronLeft, ChevronDown, Lock, Info } from 'lucide-react';
import { useSkillTree, useLessonsForSkill } from '../../hooks/useSkillTree';

const MotionBox = motion(Box);

/** Высота `SiteHeader` (примерно), чтобы вложенный sticky не залезал под глобальный хедер */
const CATEGORY_STICKY_TOP = '3.75rem';

const STATUS_ICONS = {
  completed: '✅',
  current: '▶️',
  available: '⚪',
};

// ─── Category card in the grid ───────────────────────────────────────────────

function CategoryCard({ category, onClick }) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.600');
  const reduceMotion = useReducedMotion();
  const pct = category.progress_pct ?? 0;
  const isDone = pct >= 100;

  return (
    <MotionBox
      as="button"
      type="button"
      w="100%"
      textAlign="left"
      p={4}
      minH="44px"
      bg={bg}
      border="1px solid"
      borderColor={isDone ? 'green.300' : border}
      borderRadius="2xl"
      cursor="pointer"
      onClick={onClick}
      {...(reduceMotion
        ? {}
        : {
            whileHover: { scale: 1.02 },
            whileTap: { scale: 0.97 },
            transition: { duration: 0.18 },
          })}
      aria-label={`Открыть категорию «${category.title}»`}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="2xl" aria-hidden>{category.icon ?? '🐾'}</Text>
          {isDone && <Badge colorScheme="green" variant="subtle" fontSize="xs">Готово</Badge>}
        </HStack>
        <Box>
          <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{category.title}</Text>
          <Text fontSize="xs" color="mutedFg" noOfLines={2} mt={0.5}>{category.description}</Text>
        </Box>
        <Box>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="xs" color="mutedFg">{pct}%</Text>
            <Text fontSize="xs" color="mutedFg">{category.skills?.length ?? 0} навыков</Text>
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
          <Box
            key={lesson.id}
            as={RouterLink}
            to={`/lesson/${lesson.id}`}
            state={lessonNavState('/skills')}
            _hover={{ textDecoration: 'none' }}
          >
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
  const reduceMotion = useReducedMotion();
  const detailBg = useColorModeValue('gray.50', 'gray.900');
  const hintBg = useColorModeValue('orange.50', 'orange.900');
  const hintBorder = useColorModeValue('orange.100', 'orange.700');
  const hintText = useColorModeValue('orange.800', 'orange.200');

  const pct = skill.progress_pct ?? 0;
  const isDone = skill.is_complete;
  const bonesLabel = `${skill.bones_earned ?? 0} / ${skill.target_bones ?? 5} 🦴`;

  return (
    <Box w="100%">
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
        transition={{ duration: 0.15 }}
        _hover={{ boxShadow: 'sm' }}
      >
        <HStack justify="space-between" align="flex-start" spacing={3} mb={2}>
          <Box flex="1" minW={0}>
            <Flex flexWrap="wrap" gap={2} align="center" mb={0.5}>
              <Text fontWeight="semibold" fontSize="sm" flex="1" minW="120px" noOfLines={2}>
                {skill.title}
              </Text>
              {isDone && (
                <Badge colorScheme="green" variant="subtle" fontSize="xs" flexShrink={0}>
                  Готово
                </Badge>
              )}
              {skill.unlock_hint && !isDone && (
                <Badge colorScheme="orange" variant="subtle" fontSize="xs" flexShrink={0}>
                  <HStack spacing={1}><Lock size={9} /><span>Рекомендация</span></HStack>
                </Badge>
              )}
            </Flex>
            <Text fontSize="xs" color={muted} noOfLines={2}>{skill.description}</Text>
          </Box>
          <VStack spacing={1} flexShrink={0} align="flex-end" pt={0.5}>
            <Text fontSize="xs" color={muted} textAlign="right" whiteSpace="nowrap">
              {bonesLabel}
            </Text>
            <MotionBox
              display="flex"
              alignItems="center"
              justifyContent="center"
              minW="44px"
              minH="44px"
              color={muted}
              {...(reduceMotion
                ? {}
                : { animate: { rotate: isExpanded ? 180 : 0 }, transition: { duration: 0.2 } })}
            >
              <ChevronDown
                size={18}
                style={{ transform: reduceMotion && isExpanded ? 'rotate(180deg)' : undefined }}
              />
            </MotionBox>
          </VStack>
        </HStack>
        <Progress
          value={pct}
          colorScheme={isDone ? 'green' : 'purple'}
          size="xs"
          borderRadius="full"
        />
      </MotionBox>

      <ReducedMotionAnimatePresence initial={false}>
        {isExpanded && (
          <MotionBox
            key="atom-detail"
            initial={{ opacity: 0, height: reduceMotion ? 'auto' : 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: reduceMotion ? 'auto' : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            overflow="hidden"
          >
            <Box mt={1.5} p={4} bg={detailBg} borderRadius="xl" border="1px dashed" borderColor={border}>
              <VStack align="stretch" spacing={3}>
                {skill.unlock_hint && !isDone && (
                  <Box p={2.5} bg={hintBg} borderRadius="md" border="1px solid" borderColor={hintBorder}>
                    <HStack spacing={2} align="flex-start">
                      <Box as="span" display="inline-flex" pt={0.5} flexShrink={0}>
                        <Info size={13} />
                      </Box>
                      {skill.unlock_hint_skill_key ? (
                        <Text fontSize="xs" color={hintText}>
                          Рекомендуем сначала:{' '}
                          <Link
                            as={RouterLink}
                            to={`/skills?skill=${encodeURIComponent(skill.unlock_hint_skill_key)}`}
                            color={hintText}
                            fontWeight="semibold"
                            textDecoration="underline"
                            _hover={{ opacity: 0.88 }}
                          >
                            «{skill.unlock_hint_skill_title || skill.unlock_hint_skill_key}»
                          </Link>
                        </Text>
                      ) : (
                        <Text fontSize="xs" color={hintText}>{skill.unlock_hint}</Text>
                      )}
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
      </ReducedMotionAnimatePresence>
    </Box>
  );
}

// ─── Category detail view ─────────────────────────────────────────────────────

function CategoryDetail({ category, onBack, initialExpandedSkillKey }) {
  const [expandedKey, setExpandedKey] = useState(null);
  const muted = useColorModeValue('gray.600', 'gray.400');
  const headerBg = useColorModeValue('white', 'gray.800');
  const progressDividerColor = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    if (!initialExpandedSkillKey) return;
    if (category.skills?.some((s) => s.key === initialExpandedSkillKey)) {
      setExpandedKey(initialExpandedSkillKey);
    }
  }, [category.key, initialExpandedSkillKey]);

  const toggle = (key) => setExpandedKey((prev) => (prev === key ? null : key));

  const headerBorder = useColorModeValue('gray.200', 'gray.600');
  const headerShadow = useColorModeValue(
    '0 2px 12px rgba(124, 58, 237, 0.06)',
    '0 2px 16px rgba(0, 0, 0, 0.35)'
  );

  return (
    <Box pb={24}>
      <Box
        position="sticky"
        top={CATEGORY_STICKY_TOP}
        zIndex={11}
        bg={headerBg}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={headerBorder}
        boxShadow={headerShadow}
        px={{ base: 3, sm: 4 }}
        py={4}
        mb={3}
      >
        <HStack spacing={3} align="flex-start">
          <IconButton
            icon={<ChevronLeft size={20} />}
            variant="ghost"
            size="sm"
            borderRadius="xl"
            aria-label="Назад к категориям"
            onClick={onBack}
            flexShrink={0}
            mt={0.5}
          />
          <HStack spacing={3} align="flex-start" minW={0} flex={1}>
            <Flex
              align="center"
              justify="center"
              w="48px"
              h="48px"
              flexShrink={0}
              borderRadius="xl"
              bg="purple.50"
              borderWidth="1px"
              borderColor="purple.100"
              _dark={{ bg: 'whiteAlpha.100', borderColor: 'whiteAlpha.200' }}
            >
              <Text fontSize="2xl" aria-hidden lineHeight="1">
                {category.icon ?? '🐾'}
              </Text>
            </Flex>
            <Box minW={0} flex={1}>
              <Text fontWeight="bold" fontSize="md" noOfLines={2}>
                {category.title}
              </Text>
              <Text fontSize="xs" color={muted} noOfLines={3} mt={1} lineHeight="short">
                {category.description}
              </Text>
            </Box>
          </HStack>
        </HStack>
        <Box
          mt={4}
          pt={4}
          borderTopWidth="1px"
          borderTopColor={progressDividerColor}
        >
          <HStack justify="space-between" mb={1.5}>
            <Text fontSize="xs" fontWeight="medium" color={muted}>Общий прогресс</Text>
            <Text fontSize="xs" fontWeight="semibold" color={muted}>{category.progress_pct ?? 0}%</Text>
          </HStack>
          <Progress
            value={category.progress_pct ?? 0}
            colorScheme={(category.progress_pct ?? 0) >= 100 ? 'green' : 'purple'}
            size="sm"
            borderRadius="full"
          />
        </Box>
      </Box>

      <VStack spacing={2.5} align="stretch" mt={2}>
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
  const { data: tree, isLoading, isError, error, refetch, isFetching } = useSkillTree();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null);
  const [deepLinkSkill, setDeepLinkSkill] = useState(null);
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    if (!tree?.length) return;
    const skill = searchParams.get('skill');
    if (!skill) {
      setDeepLinkSkill(null);
      return;
    }
    const cat = tree.find((c) => c.skills?.some((s) => s.key === skill));
    if (cat) {
      setActiveCategory(cat.key);
      setDeepLinkSkill(skill);
    }
  }, [tree, searchParams]);

  function handleCategoryBack() {
    setActiveCategory(null);
    setDeepLinkSkill(null);
    setSearchParams({}, { replace: true });
  }

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

  if (isError) {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      'Не удалось загрузить навыки';
    return (
      <Box pb={24} px={2}>
        <VStack spacing={4} py={10} align="stretch">
          <Text fontSize="lg" fontWeight="bold">Навыки</Text>
          <Box textAlign="center" py={6} px={2}>
            <Text color="red.500" fontSize="sm" mb={3}>
              {msg}
            </Text>
            <Button
              size="sm"
              colorScheme="purple"
              onClick={() => refetch()}
              isLoading={isFetching}
            >
              Повторить
            </Button>
          </Box>
        </VStack>
      </Box>
    );
  }

  if (activeCategory) {
    const cat = categories.find((c) => c.key === activeCategory);
    if (cat) {
      return (
        <Box px={2} py={2}>
          <CategoryDetail
            key={cat.key}
            category={cat}
            onBack={handleCategoryBack}
            initialExpandedSkillKey={deepLinkSkill}
          />
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
          <Box textAlign="center" py={12} px={2}>
            <Text fontSize="3xl" mb={3}>🐾</Text>
            <Text color={muted} fontSize="sm" mb={2}>
              Каталог навыков пуст.
            </Text>
            {import.meta.env.DEV && (
              <Text fontSize="xs" color={muted}>
                В каталоге нет категорий — выполните в папке backend: npm run db:seed
              </Text>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
}
