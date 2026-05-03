import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Button,
  SimpleGrid,
  Skeleton,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronDown, MapPin } from 'lucide-react';
import { useRoutes, useSelectRoute } from '../../hooks/useRoutes';

const MotionBox = motion(Box);

// ─── Route card ───────────────────────────────────────────────────────────────

function RouteCard({ route, isSelected, onSelect, isSelecting }) {
  const [expanded, setExpanded] = useState(false);
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.600');
  const selectedBorder = 'purple.400';
  const muted = useColorModeValue('gray.600', 'gray.400');
  const skillBg = useColorModeValue('gray.50', 'gray.700');

  const ageLabel = () => {
    if (route.age_min_months == null && route.age_max_months == null) return null;
    if (route.age_max_months == null) return `от ${route.age_min_months} мес.`;
    if (route.age_min_months === 0) return `до ${route.age_max_months} мес.`;
    return `${route.age_min_months}–${route.age_max_months} мес.`;
  };

  return (
    <MotionBox
      bg={bg}
      border="2px solid"
      borderColor={isSelected ? selectedBorder : border}
      borderRadius="2xl"
      overflow="hidden"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.18 }}
    >
      <Box p={4}>
        <HStack justify="space-between" mb={2}>
          <HStack spacing={3}>
            <Text fontSize="2xl" aria-hidden>{route.icon ?? '🐾'}</Text>
            <Box>
              <HStack spacing={2}>
                <Text fontWeight="bold" fontSize="md">{route.title}</Text>
                {isSelected && (
                  <Badge colorScheme="purple" variant="solid" fontSize="xs">
                    <HStack spacing={1}><CheckCircle size={10} /><span>Мой</span></HStack>
                  </Badge>
                )}
              </HStack>
              {ageLabel() && <Text fontSize="xs" color={muted}>{ageLabel()}</Text>}
            </Box>
          </HStack>
          <MotionBox
            as="button"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded((v) => !v)}
            color={muted}
            aria-label="Раскрыть маршрут"
          >
            <ChevronDown size={18} />
          </MotionBox>
        </HStack>

        <Text fontSize="sm" color={muted} mb={3}>{route.description}</Text>

        <HStack justify="space-between" mb={1}>
          <Text fontSize="xs" color={muted}>Прогресс</Text>
          <Text fontSize="xs" color={muted}>{route.progress_pct ?? 0}%</Text>
        </HStack>
        <Progress
          value={route.progress_pct ?? 0}
          colorScheme={isSelected ? 'purple' : 'gray'}
          size="xs"
          borderRadius="full"
          mb={3}
        />

        <Button
          colorScheme={isSelected ? 'purple' : 'gray'}
          variant={isSelected ? 'solid' : 'outline'}
          size="sm"
          w="full"
          borderRadius="lg"
          isLoading={isSelecting}
          onClick={onSelect}
          leftIcon={isSelected ? <CheckCircle size={14} /> : <MapPin size={14} />}
        >
          {isSelected ? 'Активный маршрут' : 'Выбрать маршрут'}
        </Button>
      </Box>

      <AnimatePresence initial={false}>
        {expanded && (
          <MotionBox
            key="skills"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            overflow="hidden"
          >
            <Divider />
            <Box p={4} bg={skillBg}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={muted} mb={2}>
                Навыки маршрута
              </Text>
              <VStack align="stretch" spacing={1.5}>
                {(route.skills ?? []).map((rs, i) => (
                  <HStack key={rs.skill_key} spacing={2}>
                    <Text fontSize="xs" color={muted} w="16px" textAlign="right">{i + 1}.</Text>
                    <Text fontSize="xs" color={rs.bones_earned > 0 ? 'green.600' : muted}>
                      {rs.skill_key}
                    </Text>
                    {rs.bones_earned > 0 && (
                      <Text fontSize="xs" color="green.500">{rs.bones_earned} 🦴</Text>
                    )}
                  </HStack>
                ))}
              </VStack>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </MotionBox>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function RoutesScreen() {
  const { data: routes, isLoading } = useRoutes();
  const selectRoute = useSelectRoute();
  const muted = useColorModeValue('gray.600', 'gray.400');
  const [selectingKey, setSelectingKey] = useState(null);

  const selectedRoute = routes?.find((r) => r.is_selected);

  async function handleSelect(routeKey) {
    setSelectingKey(routeKey);
    try {
      await selectRoute.mutateAsync(routeKey);
    } finally {
      setSelectingKey(null);
    }
  }

  if (isLoading) {
    return (
      <Box px={2} py={6}>
        <VStack spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height="140px" borderRadius="2xl" w="100%" />
          ))}
        </VStack>
      </Box>
    );
  }

  const allRoutes = routes ?? [];

  return (
    <Box pb={24} px={2}>
      <VStack spacing={5} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="bold">Маршруты</Text>
          <Text fontSize="sm" color={muted} mt={1}>
            Персональный путь по навыкам вашей собаки
          </Text>
        </Box>

        {selectedRoute && (
          <Box px={3} py={2.5} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
            <HStack spacing={2}>
              <Text fontSize="lg" aria-hidden>{selectedRoute.icon}</Text>
              <Box>
                <Text fontSize="xs" color="purple.600" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">
                  Ваш маршрут
                </Text>
                <Text fontSize="sm" fontWeight="semibold">{selectedRoute.title}</Text>
              </Box>
              <Box flex={1} />
              <Text fontSize="sm" color="purple.600" fontWeight="bold">{selectedRoute.progress_pct ?? 0}%</Text>
            </HStack>
          </Box>
        )}

        <VStack spacing={3} align="stretch">
          {allRoutes.map((route, i) => (
            <motion.div
              key={route.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <RouteCard
                route={route}
                isSelected={route.is_selected}
                isSelecting={selectingKey === route.key}
                onSelect={() => handleSelect(route.key)}
              />
            </motion.div>
          ))}
        </VStack>

        {allRoutes.length === 0 && (
          <Box textAlign="center" py={12}>
            <Text fontSize="3xl" mb={3}>🗺️</Text>
            <Text color={muted}>Маршруты загружаются...</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
