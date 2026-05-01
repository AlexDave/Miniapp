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
  Card,
  CardBody,
  Icon,
  useColorModeValue,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BookOpen,
  Target,
  Trophy,
  Calendar,
  Play,
  Award,
  Zap,
} from 'lucide-react';
import useStore from '../store';
import { useCourses } from '../hooks/useCourses';
import { useTracks } from '../hooks/useTracks';
import { useProfile } from '../hooks/useProfile';
import TodayLesson from './lesson/TodayLesson';
import { useUserStats } from '../hooks/useProgress';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

function Dashboard() {
  const { userProfile } = useStore();

  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const { data: tracks = [], isLoading: tracksLoading } = useTracks();
  const { data: userStats } = useUserStats();
  useProfile(); // загружает профиль и синхронизирует Zustand store

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const activeTracks = tracks.filter((t) => !t.is_completed);
  const recentCourses = courses.slice(0, 3);

  const stats = {
    totalCourses: courses.length,
    activeTracks: activeTracks.length,
    weeklyProgress:
      courses.length > 0
        ? Math.round((tracks.filter((t) => t.is_completed).length / Math.max(tracks.length, 1)) * 100)
        : 0,
  };

  const getLevelProgress = () => {
    const expForNextLevel = userProfile.level * 100;
    return ((userProfile.experience % expForNextLevel) / expForNextLevel) * 100;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const isLoading = coursesLoading || tracksLoading;

  return (
    <Box pb={20}>
      <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Welcome Section */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Box>
            <Heading size="lg" color="purple.600" mb={2}>
              {getGreeting()}, {userProfile.petName}! 🐕
            </Heading>
            <Text color={textColor} fontSize="lg">
              Продолжайте обучение и развивайте навыки вашего питомца
            </Text>
          </Box>

          {/* Урок дня */}
          <TodayLesson />

          {/* Level Progress */}
          <Card bg={bg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between" mb={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={textColor}>Уровень {userProfile.level}</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {userProfile.experience} XP
                  </Text>
                </VStack>
                <Icon as={Trophy} w={8} h={8} color="yellow.500" />
              </HStack>
              <Progress value={getLevelProgress()} colorScheme="purple" size="lg" borderRadius="full" />
              <Text fontSize="sm" color={textColor} mt={2}>
                {userProfile.experience % (userProfile.level * 100)} / {userProfile.level * 100} XP до следующего уровня
              </Text>
            </CardBody>
          </Card>
        </VStack>

        {/* Stats Grid */}
        {isLoading ? (
          <Flex justify="center" py={8}>
            <Spinner size="lg" color="purple.500" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={8}>
            <MotionCard whileHover={{ scale: 1.05 }} bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={BookOpen} w={6} h={6} color="purple.500" mb={2} />
                <Stat>
                  <StatNumber color="purple.600">{stats.totalCourses}</StatNumber>
                  <StatLabel fontSize="sm">Всего курсов</StatLabel>
                </Stat>
              </CardBody>
            </MotionCard>

            <MotionCard whileHover={{ scale: 1.05 }} bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={Target} w={6} h={6} color="blue.500" mb={2} />
                <Stat>
                  <StatNumber color="blue.600">{stats.activeTracks}</StatNumber>
                  <StatLabel fontSize="sm">Активных треков</StatLabel>
                </Stat>
              </CardBody>
            </MotionCard>

            <MotionCard whileHover={{ scale: 1.05 }} bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={TrendingUp} w={6} h={6} color="orange.500" mb={2} />
                <Stat>
                  <StatNumber color="orange.600">{stats.weeklyProgress}%</StatNumber>
                  <StatLabel fontSize="sm">Прогресс треков</StatLabel>
                </Stat>
              </CardBody>
            </MotionCard>
          </SimpleGrid>
        )}

        {/* Quick Actions */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Heading size="md" color="purple.600">Быстрые действия</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              as={Link}
              to="/courses"
              bg={bg}
              border="1px solid"
              borderColor={borderColor}
              cursor="pointer"
            >
              <CardBody>
                <HStack spacing={4}>
                  <Box p={3} bg="purple.100" borderRadius="full" color="purple.600">
                    <Icon as={Play} w={6} h={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Начать обучение</Text>
                    <Text fontSize="sm" color={textColor}>Выберите курс для изучения</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </MotionCard>

            <MotionCard
              whileHover={{ scale: 1.02 }}
              as={Link}
              to="/tracks"
              bg={bg}
              border="1px solid"
              borderColor={borderColor}
              cursor="pointer"
            >
              <CardBody>
                <HStack spacing={4}>
                  <Box p={3} bg="blue.100" borderRadius="full" color="blue.600">
                    <Icon as={Target} w={6} h={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Мои треки</Text>
                    <Text fontSize="sm" color={textColor}>Просмотр активных заданий</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </MotionCard>
          </SimpleGrid>
        </VStack>

        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <VStack spacing={4} align="stretch" mb={8}>
            <HStack justify="space-between">
              <Heading size="md" color="purple.600">Курсы</Heading>
              <Button as={Link} to="/courses" variant="ghost" size="sm" color="purple.500">
                Все курсы →
              </Button>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {recentCourses.map((course) => (
                <MotionCard
                  key={course.id}
                  whileHover={{ scale: 1.02 }}
                  as={Link}
                  to={`/course/${course.id}`}
                  bg={bg}
                  border="1px solid"
                  borderColor={borderColor}
                  cursor="pointer"
                >
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" width="100%">
                        <Text fontWeight="semibold" noOfLines={2}>{course.title}</Text>
                        {course.difficulty && (
                          <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                            {course.difficulty}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color={textColor} noOfLines={2}>
                        {course.description}
                      </Text>
                      {course.rating > 0 && (
                        <HStack spacing={1}>
                          <Icon as={Award} w={3} h={3} color="yellow.500" />
                          <Text fontSize="xs" color={textColor}>{course.rating.toFixed(1)}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        )}

        {/* Streak Section */}
        <MotionCard bg="purple.500" color="white">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={Zap} w={5} h={5} />
                  <Text fontWeight="semibold">Серия обучения</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold">
                  {userProfile.streak} {userProfile.streak === 1 ? 'день' : 'дней'} подряд
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Продолжайте ежедневное обучение для получения бонусов
                </Text>
              </VStack>
              <Box p={4} bg="rgba(255, 255, 255, 0.2)" borderRadius="full">
                <Icon as={Calendar} w={8} h={8} />
              </Box>
            </HStack>
          </CardBody>
        </MotionCard>
      </MotionBox>
    </Box>
  );
}

export default Dashboard;
