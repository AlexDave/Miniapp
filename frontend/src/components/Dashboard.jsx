import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Button,
  Skeleton,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useDismissCoachTip } from '../hooks/useCoachTips';
import { formatPrimaryProblem } from '../constants/onboarding';
import { useRoutes, useSelectRoute } from '../hooks/useRoutes';
import RouteCard from './routes/RouteCard';
import DashboardTodayPractice from './dashboard/DashboardTodayPractice';
import BehaviorIncidentDrawer from './behavior/BehaviorIncidentDrawer';

const MotionBox = motion(Box);

/** Блок «Сегодня» + кнопка «Начать практику» (`DashboardTodayPractice`). Включить, когда будет финальный UX. */
const SHOW_TODAY_PRACTICE_BLOCK = false;

export default function Dashboard() {
  const { data: profile } = useProfile();
  const dismissTip = useDismissCoachTip();
  const { data: routesData, isLoading: routesLoading } = useRoutes();
  const selectRoute = useSelectRoute();
  const [selectingKey, setSelectingKey] = useState(null);
  const [behaviorOpen, setBehaviorOpen] = useState(false);

  const muted = 'mutedFg';
  const incidentBg = useColorModeValue('purple.50', 'whiteAlpha.50');
  const incidentBorder = useColorModeValue('purple.200', 'purple.600');
  const incidentIconBg = useColorModeValue('white', 'whiteAlpha.150');
  const incidentHoverBg = useColorModeValue('purple.100', 'whiteAlpha.100');
  const incidentChevron = useColorModeValue('purple.400', 'purple.300');
  const routes = routesData?.routes ?? [];
  const selected = routes.find((r) => r.is_selected);

  const showDashboardCoach =
    profile?.onboardingCompleted === true && profile?.coachTips?.dashboard !== true;

  async function handleSelectRoute(routeKey) {
    setSelectingKey(routeKey);
    try {
      await selectRoute.mutateAsync(routeKey);
    } finally {
      setSelectingKey(null);
    }
  }

  return (
    <Box pb={24}>
      <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <VStack spacing={5} align="stretch">
          {showDashboardCoach && (
            <Alert status="info" borderRadius="xl" fontSize="sm">
              <AlertIcon />
              <Box flex="1">
                <Text fontWeight="medium">Один шаг в день</Text>
                <Text mt={1}>
                  Сначала короткая практика по теме дня, затем короткий отчёт — так растёт серия и навыки.
                </Text>
                <Button
                  size="sm"
                  mt={2}
                  colorScheme="purple"
                  variant="outline"
                  onClick={() => dismissTip.mutate('dashboard')}
                  isLoading={dismissTip.isLoading}
                >
                  Понятно
                </Button>
              </Box>
            </Alert>
          )}

          {profile?.primaryProblem != null && profile.primaryProblem !== '' && (
            <Text fontSize="xs" color={muted}>
              Фокус: {formatPrimaryProblem(profile.primaryProblem)}
            </Text>
          )}

          <Box>
            {routesLoading ? (
              <Skeleton height="200px" borderRadius="2xl" />
            ) : selected ? (
              <RouteCard
                route={selected}
                isSelected
                surface="home"
                isSelecting={selectingKey === selected.key}
                onSelect={() => handleSelectRoute(selected.key)}
              />
            ) : routes.length > 0 ? (
              <Text fontSize="sm" color={muted}>
                Маршрут не выбран. Укажите его в{' '}
                <Text as={Link} to="/profile/marshrut" color="purple.500" fontWeight="medium" display="inline">
                  профиле
                </Text>
                .
              </Text>
            ) : (
              <Text fontSize="sm" color={muted}>
                Маршруты загружаются после настройки базы.
              </Text>
            )}
          </Box>

          {SHOW_TODAY_PRACTICE_BLOCK ? <DashboardTodayPractice /> : null}

          <Box
            as="button"
            type="button"
            w="100%"
            textAlign="left"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor={incidentBorder}
            bg={incidentBg}
            px={4}
            py={3.5}
            transition="background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease"
            cursor="pointer"
            boxShadow="sm"
            _hover={{
              bg: incidentHoverBg,
              boxShadow: 'md',
            }}
            _active={{ transform: 'scale(0.992)' }}
            onClick={() => setBehaviorOpen(true)}
            aria-label="Открыть форму: отметить инцидент поведения"
          >
            <HStack spacing={3} align="center">
              <Flex
                w={11}
                h={11}
                borderRadius="xl"
                bg={incidentIconBg}
                align="center"
                justify="center"
                flexShrink={0}
                borderWidth="1px"
                borderColor={incidentBorder}
                boxShadow="sm"
                color="purple.600"
                _dark={{ color: 'purple.300' }}
              >
                <ClipboardList size={22} strokeWidth={2} />
              </Flex>
              <VStack align="start" spacing={0.5} minW={0} flex={1}>
                <Text fontWeight="semibold" fontSize="sm" color="purple.800" _dark={{ color: 'purple.100' }}>
                  Отметить инцидент
                </Text>
                <Text fontSize="xs" color={muted} noOfLines={2} lineHeight="short">
                  Лай, поведение на прогулке — чтобы подобрать уроки
                </Text>
              </VStack>
              <Box color={incidentChevron} flexShrink={0} aria-hidden>
                <ChevronRight size={22} />
              </Box>
            </HStack>
          </Box>
          <BehaviorIncidentDrawer isOpen={behaviorOpen} onClose={() => setBehaviorOpen(false)} />
        </VStack>
      </MotionBox>
    </Box>
  );
}
