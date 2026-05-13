import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Text,
  VStack,
  Spinner,
  Button,
  SimpleGrid,
  Badge,
  Icon,
  useToast,
  HStack,
  Card,
  CardBody,
  Progress,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Star,
  Play,
  Award,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useApi } from '../hooks/useApi.js';
import config from '../config.jsx';
import useStore from '../store';
import { useProfile } from '../hooks/useProfile';
import { partitionCoursesByAge } from '../constants/onboarding';

const MotionCard = motion(Card);

function Library() {
  const [courses, setCourses] = useState([]);
  const { loading, error, get } = useApi();
  const { courseProgress } = useStore();
  const { data: profile } = useProfile();
  const toast = useToast();

  const forYou = useMemo(() => {
    if (!profile?.dogAgeBucket || !courses.length) return null;
    return partitionCoursesByAge(courses, profile.dogAgeBucket);
  }, [courses, profile?.dogAgeBucket]);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await get(config.api.endpoints.courses);
        setCourses(data);
      } catch (err) {
        toast({
          title: 'Ошибка загрузки',
          description: err.message || 'Не удалось загрузить библиотеку',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }

    fetchCourses();
  }, [get, toast]);

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'easy') return 'green';
    if (difficulty === 'medium') return 'yellow';
    if (difficulty === 'hard') return 'red';
    return 'gray';
  };

  const getDifficultyText = (difficulty) => {
    if (difficulty === 'easy') return 'Начинающий';
    if (difficulty === 'medium') return 'Средний';
    if (difficulty === 'hard') return 'Сложный';
    return null;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'obedience': return <BookOpen size={16} />;
      case 'tricks': return <Award size={16} />;
      case 'behavior': return <Users size={16} />;
      case 'training': return <TrendingUp size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'obedience': return 'Послушание';
      case 'tricks': return 'Трюки';
      case 'behavior': return 'Поведение';
      case 'training': return 'Обучение';
      default: return 'Общее';
    }
  };

  if (loading) {
    return (
      <VStack spacing={3} align="center" justify="center" h="50vh">
        <Spinner size="lg" color="purple.500" />
        <Text fontSize="sm" color={textColor}>Загрузка...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={4} align="center" justify="center" py={16} px={4}>
        <Text fontWeight="semibold" color="red.500">{error}</Text>
        <Button
          size="sm"
          colorScheme="purple"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </Button>
      </VStack>
    );
  }

  return (
    <Box pb={20}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="purple.600" mb={2}>
            Библиотека
          </Heading>
          <Text color={textColor}>
            Выберите программу для обучения вашего питомца
          </Text>
        </Box>

        {forYou && forYou.primary.length > 0 && (
          <Box>
            <Heading size="sm" color="purple.600" mb={2}>
              Подобрано для вас
            </Heading>
            <Text fontSize="sm" color={textColor} mb={4}>
              По возрасту собаки — категория «{forYou.primaryCategory}».
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={2}>
              {forYou.primary.slice(0, 4).map((course) => (
                <MotionCard
                  key={`you-${course.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  as={Link}
                  to={`/course/${course.id}`}
                  bg={bg}
                  border="2px solid"
                  borderColor="purple.200"
                  cursor="pointer"
                  overflow="hidden"
                >
                  <CardBody p={5}>
                    <Badge colorScheme="purple" mb={2}>
                      Совпадение по возрасту
                    </Badge>
                    <Text fontSize="md" fontWeight="bold" color="purple.700" noOfLines={2} mb={2}>
                      {course.title}
                    </Text>
                    <Text fontSize="sm" color={textColor} noOfLines={2}>
                      {course.description}
                    </Text>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Text color={textColor} fontSize="sm">
          Всего программ: {courses.length}
        </Text>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <VStack spacing={6} align="center" justify="center" p={8}>
            <Box textAlign="center">
              <Icon as={BookOpen} w={12} h={12} color="gray.400" mb={4} />
              <Text fontSize="xl" fontWeight="bold" color="mutedFg" mb={2}>
                Ничего не найдено
              </Text>
              <Text color={textColor}>
                Курсы появятся после настройки каталога на сервере.
              </Text>
            </Box>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {courses.map((course, index) => (
              <MotionCard
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                as={Link}
                to={`/course/${course.id}`}
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
                cursor="pointer"
                overflow="hidden"
                position="relative"
              >
                {/* Progress Bar */}
                {courseProgress[course.id] && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    height="4px"
                    bg="purple.100"
                    zIndex={1}
                  >
                    <Box
                      height="100%"
                      width={`${courseProgress[course.id]}%`}
                      bg="purple.500"
                      transition="width 0.3s"
                    />
                  </Box>
                )}

                <CardBody p={6}>
                  <VStack align="start" spacing={4}>
                    {/* Header */}
                    <HStack justify="space-between" width="100%" align="start">
                      <VStack align="start" spacing={2} flex="1">
                        <HStack spacing={2}>
                          {course.category && (
                            <Box
                              p={2}
                              bg="purple.100"
                              borderRadius="full"
                              color="purple.600"
                            >
                              {getCategoryIcon(course.category)}
                            </Box>
                          )}
                          {getDifficultyText(course.difficulty) && (
                            <Badge
                              colorScheme={getDifficultyColor(course.difficulty)}
                              variant="subtle"
                              fontSize="xs"
                            >
                              {getDifficultyText(course.difficulty)}
                            </Badge>
                          )}
                        </HStack>
                        
                        <Text fontSize="lg" fontWeight="semibold" color="purple.700" noOfLines={2}>
                          {course.title}
                        </Text>
                      </VStack>
                      
                      {course.isCompleted && (
                        <Badge colorScheme="green" variant="solid">
                          Завершен
                        </Badge>
                      )}
                    </HStack>
                    
                    {/* Description */}
                    <Text fontSize="sm" color={textColor} noOfLines={3} lineHeight="1.5">
                      {course.description}
                    </Text>
                    
                    {/* Stats */}
                    <VStack align="start" spacing={2} width="100%">
                      <HStack justify="space-between" width="100%">
                        <HStack spacing={4}>
                          {course.duration && (
                            <HStack spacing={1} color={textColor}>
                              <Icon as={Clock} size={14} />
                              <Text fontSize="xs">{course.duration}</Text>
                            </HStack>
                          )}
                          {course.rating && (
                            <HStack spacing={1} color="yellow.500">
                              <Icon as={Star} size={14} />
                              <Text fontSize="xs">{course.rating}</Text>
                            </HStack>
                          )}
                        </HStack>
                        {course.category && (
                          <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                            {getCategoryText(course.category)}
                          </Text>
                        )}
                      </HStack>
                      
                      {/* Progress */}
                      {courseProgress[course.id] && (
                        <Box width="100%">
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color={textColor}>Прогресс</Text>
                            <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                              {courseProgress[course.id]}%
                            </Text>
                          </HStack>
                          <Progress 
                            value={courseProgress[course.id]} 
                            colorScheme="purple" 
                            size="sm" 
                            borderRadius="full"
                          />
                        </Box>
                      )}
                    </VStack>
                    
                    {/* Action Button */}
                    <Button
                      size="sm"
                      colorScheme="purple"
                      variant="outline"
                      width="100%"
                      leftIcon={<Play size={16} />}
                      _hover={{ bg: 'purple.50' }}
                    >
                      {course.isCompleted ? 'Повторить программу' : 'Начать обучение'}
                    </Button>
                  </VStack>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
}

export default Library;
