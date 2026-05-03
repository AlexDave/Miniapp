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

  const prevLevelXP = userStats?.level
    ? [0, 0, 100, 300, 700][userStats.level - 1] ?? 0
    : 0;
  const nextXp = userStats?.next_level_xp ?? null;
  const xpBarPct =
    nextXp && userStats?.total_xp != null
      ? Math.min(
          100,
          ((userStats.total_xp - prevLevelXP) / Math.max(nextXp - prevLevelXP, 1)) * 100
        )
      : 0;

  const streak = userStats?.streak ?? userProfile.streak ?? 0;

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

          <Box
            px={3}
            py={3}
            borderRadius="xl"
            bg={compactBg}
            border="1px solid"
            borderColor={compactBorder}
          >
            <HStack justify="space-between" align="center" spacing={3} flexWrap="wrap" mb={2}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {userStats?.level_name
                  ? `Ур. ${userStats.level} · ${userStats.level_name}`
                  : `Уровень ${userProfile.level}`}
              </Text>
              <HStack spacing={2} flexShrink={0}>
                <Text fontSize="sm" color="purple.600" fontWeight="bold">
                  {userStats?.total_xp ?? userProfile.experience} XP
                </Text>
                {streak > 0 && (
                  <Badge colorScheme="orange" px={2} py={0.5} borderRadius="full" fontSize="xs">
                    {streak}🔥
                  </Badge>
                )}
              </HStack>
            </HStack>
            <Progress value={xpBarPct} colorScheme="purple" size="xs" borderRadius="full" />
            <Text fontSize="xs" color={muted} mt={1.5}>
              {userStats?.xp_to_next != null
                ? `${userStats.xp_to_next} XP до следующего уровня`
                : 'Максимальный уровень'}
            </Text>
          </Box>

          <TodayLesson />

          <HStack spacing={4} px={0.5} fontSize="xs" color={muted}>
            <Text as={Link} to="/courses" color="purple.500" fontWeight="medium">
              Все курсы →
            </Text>
            <Text as="span" color={muted}>
              ·
            </Text>
            <Text as={Link} to="/tracks" color="purple.500" fontWeight="medium">
              Треки →
            </Text>
          </HStack>
        </VStack>
      </MotionBox>
    </Box>
  );
}

export default Dashboard;
