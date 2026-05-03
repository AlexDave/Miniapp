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
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import { useDismissCoachTip } from '../hooks/useCoachTips';
import { formatPrimaryProblem } from '../constants/onboarding';
import { useRoutes, useSelectRoute } from '../hooks/useRoutes';
import RouteCard from './routes/RouteCard';
import DashboardTodayPractice from './dashboard/DashboardTodayPractice';
import DashboardPetActivity from './dashboard/DashboardPetActivity';
import BehaviorIncidentDrawer from './behavior/BehaviorIncidentDrawer';

const MotionBox = motion(Box);

export default function Dashboard() {
  const { data: profile } = useProfile();
  const dismissTip = useDismissCoachTip();
  const { data: routesData, isLoading: routesLoading } = useRoutes();
  const selectRoute = useSelectRoute();
  const [selectingKey, setSelectingKey] = useState(null);
  const [behaviorOpen, setBehaviorOpen] = useState(false);

  const muted = 'mutedFg';
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

          <Box minH={{ base: '48vh', md: '52vh' }} maxH="70vh">
            {routesLoading ? (
              <Skeleton height="100%" minH="240px" borderRadius="2xl" />
            ) : selected ? (
              <RouteCard
                route={selected}
                isSelected
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

          <DashboardTodayPractice />

          <DashboardPetActivity />

          <HStack spacing={3} flexWrap="wrap">
            <Button
              size="sm"
              variant="outline"
              colorScheme="purple"
              borderRadius="xl"
              onClick={() => setBehaviorOpen(true)}
            >
              Отметить инцидент
            </Button>
          </HStack>
          <BehaviorIncidentDrawer isOpen={behaviorOpen} onClose={() => setBehaviorOpen(false)} />

          <Box px={0.5} fontSize="xs">
            <Text as={Link} to="/library" color="purple.500" fontWeight="medium">
              Библиотека →
            </Text>
          </Box>
        </VStack>
      </MotionBox>
    </Box>
  );
}
