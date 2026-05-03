import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Card,
  CardBody,
  Button,
  SimpleGrid,
  Spinner,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BookOpen, Target } from 'lucide-react';
import useStore from '../store';
import { useCourses } from '../hooks/useCourses';
import { useTracks } from '../hooks/useTracks';
import { useProfile } from '../hooks/useProfile';
import TodayLesson from './lesson/TodayLesson';
import { useUserStats } from '../hooks/useProgress';
import HomeSkillsPreview from './home/HomeSkillsPreview';

const MotionBox = motion(Box);

function Dashboard() {
  const { userProfile } = useStore();

  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: tracks = [], isLoading: tracksLoading } = useTracks();
  const { data: userStats } = useUserStats();
  useProfile();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const activeTracks = tracks.filter((t) => !t.is_completed);
  const recentCourses = courses.slice(0, 3);

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

  const isLoading = coursesLoading || tracksLoading;

  return (
    <Box pb={24}>
      <MotionBox initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <VStack spacing={5} align="stretch">
          <HStack justify="space-between" align="flex-start">
            <Box>
              <Heading size="md" color="purple.600">
                {getGreeting()}, {userProfile.petName} 👋
              </Heading>
              <Text fontSize="sm" color={textColor} mt={1}>
                Тренируй собаку каждый день и смотри прогресс
              </Text>
            </Box>
            {(userStats?.streak ?? userProfile.streak) > 0 && (
              <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
                🔥 {(userStats?.streak ?? userProfile.streak)}{' '}
                {(userStats?.streak ?? userProfile.streak) === 1 ? 'день' : 'дней'}
              </Badge>
            )}
          </HStack>

          <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm">
            <CardBody>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="medium">
                  {userStats?.level_name
                    ? `Уровень ${userStats.level} · ${userStats.level_name}`
                    : `Уровень ${userProfile.level}`}
                </Text>
                <Text fontSize="sm" color="purple.600" fontWeight="bold">
                  {userStats?.total_xp ?? userProfile.experience} XP
                </Text>
              </HStack>
              <Progress value={xpBarPct} colorScheme="purple" size="sm" borderRadius="full" />
              <Text fontSize="xs" color={textColor} mt={2}>
                {userStats?.xp_to_next != null
                  ? `${userStats.xp_to_next} XP до следующего уровня`
                  : 'Максимальный уровень'}
              </Text>
            </CardBody>
          </Card>

          <TodayLesson />

          <HomeSkillsPreview />

          <SimpleGrid columns={2} spacing={3}>
            <Button
              as={Link}
              to="/courses"
              variant="outline"
              colorScheme="purple"
              leftIcon={<BookOpen size={18} />}
              size="sm"
              borderRadius="xl"
            >
              Курсы
            </Button>
            <Button
              as={Link}
              to="/tracks"
              variant="outline"
              colorScheme="gray"
              leftIcon={<Target size={18} />}
              size="sm"
              borderRadius="xl"
            >
              Треки
            </Button>
          </SimpleGrid>

          {isLoading ? (
            <Box textAlign="center" py={6}>
              <Spinner color="purple.500" />
            </Box>
          ) : (
            recentCourses.length > 0 && (
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="purple.600">
                  Курсы
                </Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                  {recentCourses.map((course) => (
                    <Card
                      key={course.id}
                      as={Link}
                      to={`/course/${course.id}`}
                      bg={bg}
                      border="1px solid"
                      borderColor={borderColor}
                      cursor="pointer"
                      _hover={{ borderColor: 'purple.200' }}
                    >
                      <CardBody>
                        <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
                          {course.title}
                        </Text>
                        <Text fontSize="xs" color={textColor} noOfLines={2} mt={1}>
                          {course.description}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            )
          )}

          {!isLoading && (
            <SimpleGrid columns={2} spacing={3} pt={2}>
              <Card bg={bg} border="1px solid" borderColor={borderColor}>
                <CardBody py={3} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {courses.length}
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    Всего курсов
                  </Text>
                </CardBody>
              </Card>
              <Card bg={bg} border="1px solid" borderColor={borderColor}>
                <CardBody py={3} textAlign="center">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {activeTracks.length}
                  </Text>
                  <Text fontSize="xs" color={textColor}>
                    Активных треков
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {(userProfile.streak > 0 || (userStats?.streak ?? 0) > 0) && (
            <Box p={4} bg="purple.500" color="white" borderRadius="xl">
              <Text fontWeight="semibold" fontSize="sm">
                🔥 Серия
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {userStats?.streak ?? userProfile.streak}{' '}
                {(userStats?.streak ?? userProfile.streak) === 1 ? 'день' : 'дней'} подряд
              </Text>
              <Text fontSize="xs" opacity={0.9} mt={1}>
                Не пропускай день — серия мотивирует и даёт бонус XP
              </Text>
            </Box>
          )}
        </VStack>
      </MotionBox>
    </Box>
  );
}

export default Dashboard;
