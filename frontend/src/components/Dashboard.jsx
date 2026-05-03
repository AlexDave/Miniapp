import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  useColorModeValue,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import useStore from '../store';
import { useProfile } from '../hooks/useProfile';
import TodayLesson from './lesson/TodayLesson';
import { useUserStats } from '../hooks/useProgress';
import { useDismissCoachTip } from '../hooks/useCoachTips';
import { formatPrimaryProblem } from '../constants/onboarding';
import BoneCounter from './gamification/BoneCounter';

const MotionBox = motion(Box);

function Dashboard() {
  const { userProfile } = useStore();
  const { data: userStats } = useUserStats();
  const { data: profile } = useProfile();
  const dismissTip = useDismissCoachTip();

  const textColor = useColorModeValue('gray.600', 'gray.300');
  const muted = useColorModeValue('gray.500', 'gray.400');
  const compactBg = useColorModeValue('gray.50', 'gray.800');
  const compactBorder = useColorModeValue('gray.100', 'gray.700');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const streak = userStats?.streak ?? userProfile.streak ?? 0;
  const totalBones = profile?.totalBones ?? 0;
  const bonesStage = profile?.stage ?? 'Знакомство';
  const bonesBySkill = profile?.bones ?? {};

  const showDashboardCoach =
    profile?.onboardingCompleted === true && profile?.coachTips?.dashboard !== true;

  return (
    <Box pb={24}>
      <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading size="md" color="purple.600">
              {getGreeting()}, {userProfile.petName}
            </Heading>
            <Text fontSize="sm" color={textColor} mt={1}>
              Сегодняшний шаг — ниже.
            </Text>
            {profile?.primaryProblem != null && profile.primaryProblem !== '' && (
              <Text fontSize="xs" color={muted} mt={2}>
                Фокус: {formatPrimaryProblem(profile.primaryProblem)}
              </Text>
            )}
          </Box>

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

          <HStack justify="space-between" align="center">
            <BoneCounter total={totalBones} bySkill={bonesBySkill} stage={bonesStage} />
            {streak > 0 && (
              <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
                {streak} дн. подряд 🔥
              </Badge>
            )}
          </HStack>

          <TodayLesson />

          <HStack spacing={4} px={0.5} fontSize="xs" color={muted}>
            <Text as={Link} to="/courses" color="purple.500" fontWeight="medium">
              Библиотека →
            </Text>
            <Text as="span" color={muted}>·</Text>
            <Text as={Link} to="/skills" color="purple.500" fontWeight="medium">
              Навыки →
            </Text>
          </HStack>
        </VStack>
      </MotionBox>
    </Box>
  );
}

export default Dashboard;
