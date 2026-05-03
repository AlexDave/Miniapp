import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Text,
  VStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useProfile } from '../hooks/useProfile';
import TodayLesson from './lesson/TodayLesson';
import { useDismissCoachTip } from '../hooks/useCoachTips';
import { formatPrimaryProblem } from '../constants/onboarding';

const MotionBox = motion(Box);

function Dashboard() {
  const { data: profile } = useProfile();
  const dismissTip = useDismissCoachTip();

  const muted = useColorModeValue('gray.500', 'gray.400');

  const showDashboardCoach =
    profile?.onboardingCompleted === true && profile?.coachTips?.dashboard !== true;

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

          <TodayLesson />

          <Box px={0.5} fontSize="xs">
            <Text as={Link} to="/courses" color="purple.500" fontWeight="medium">
              Библиотека →
            </Text>
          </Box>
        </VStack>
      </MotionBox>
    </Box>
  );
}

export default Dashboard;
