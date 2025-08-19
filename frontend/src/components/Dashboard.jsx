import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  SimpleGrid,
  Avatar,
  Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BookOpen,
  Target,
  Trophy,
  Calendar,
  Star,
  Play,
  Award,
  Zap,
  Users
} from 'lucide-react';
import useStore from '../store';
import { useApi } from '../hooks/useApi';
import config from '../config';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

function Dashboard() {
  const { userProfile, courses, tracks, updateUserProfile } = useStore();
  const { loading, error, get } = useApi();
  const [recentCourses, setRecentCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    activeTracks: 0,
    weeklyProgress: 0
  });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [coursesData, tracksData] = await Promise.all([
          get(config.api.endpoints.courses),
          get(`${config.baseUrl}/api/user/tracks`)
        ]);

        const completed = coursesData.filter(c => c.isCompleted).length;
        const active = tracksData.filter(t => !t.isCompleted).length;
        
        setStats({
          totalCourses: coursesData.length,
          completedCourses: completed,
          activeTracks: active,
          weeklyProgress: Math.round((completed / coursesData.length) * 100)
        });

        setRecentCourses(coursesData.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    }

    fetchDashboardData();
  }, [get]);

  const getLevelProgress = () => {
    const expForNextLevel = userProfile.level * 100;
    const currentExp = userProfile.experience % expForNextLevel;
    return (currentExp / expForNextLevel) * 100;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <Box pb={20}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
              <Progress 
                value={getLevelProgress()} 
                colorScheme="purple" 
                size="lg" 
                borderRadius="full"
              />
              <Text fontSize="sm" color={textColor} mt={2}>
                {userProfile.experience % (userProfile.level * 100)} / {userProfile.level * 100} XP до следующего уровня
              </Text>
            </CardBody>
          </Card>
        </VStack>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={BookOpen} w={6} h={6} color="purple.500" mb={2} />
              <Stat>
                <StatNumber color="purple.600">{stats.totalCourses}</StatNumber>
                <StatLabel fontSize="sm">Всего курсов</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={Award} w={6} h={6} color="green.500" mb={2} />
              <Stat>
                <StatNumber color="green.600">{stats.completedCourses}</StatNumber>
                <StatLabel fontSize="sm">Завершено</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={Target} w={6} h={6} color="blue.500" mb={2} />
              <Stat>
                <StatNumber color="blue.600">{stats.activeTracks}</StatNumber>
                <StatLabel fontSize="sm">Активных треков</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={TrendingUp} w={6} h={6} color="orange.500" mb={2} />
              <Stat>
                <StatNumber color="orange.600">{stats.weeklyProgress}%</StatNumber>
                <StatLabel fontSize="sm">Прогресс недели</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

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
                  <Box
                    p={3}
                    bg="purple.100"
                    borderRadius="full"
                    color="purple.600"
                  >
                    <Icon as={Play} w={6} h={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Начать обучение</Text>
                    <Text fontSize="sm" color={textColor}>
                      Выберите курс для изучения
                    </Text>
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
                  <Box
                    p={3}
                    bg="blue.100"
                    borderRadius="full"
                    color="blue.600"
                  >
                    <Icon as={Target} w={6} h={6} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">Мои треки</Text>
                    <Text fontSize="sm" color={textColor}>
                      Просмотр активных заданий
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </MotionCard>
          </SimpleGrid>
        </VStack>

        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="purple.600">Недавние курсы</Heading>
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
                        <Text fontWeight="semibold" noOfLines={2}>
                          {course.title}
                        </Text>
                        {course.isCompleted && (
                          <Badge colorScheme="green" variant="solid">
                            Завершен
                          </Badge>
                        )}
                      </HStack>
                      
                      <Text fontSize="sm" color={textColor} noOfLines={2}>
                        {course.description}
                      </Text>
                      
                      {course.progress && (
                        <Box width="100%">
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color={textColor}>Прогресс</Text>
                            <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                              {course.progress}%
                            </Text>
                          </HStack>
                          <Progress 
                            value={course.progress} 
                            colorScheme="purple" 
                            size="sm" 
                            borderRadius="full"
                          />
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </VStack>
        )}

        {/* Streak Section */}
        <MotionCard
          mt={8}
          bg="linear-gradient(135deg, purple.500 0%, purple.600 100%)"
          color="white"
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={Zap} w={5} h={5} />
                  <Text fontWeight="semibold">Серия обучения</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold">
                  {userProfile.streak} дней подряд
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Продолжайте ежедневное обучение для получения бонусов
                </Text>
              </VStack>
              <Box
                p={4}
                bg="rgba(255, 255, 255, 0.2)"
                borderRadius="full"
              >
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
