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
  Flex,
  Icon,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Select,
  Card,
  CardBody,
  Progress,
  useColorModeValue,
  Heading,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Search, 
  Filter,
  Play,
  Award,
  Users,
  TrendingUp
} from 'lucide-react';
import { useApi } from '../hooks/useApi.js';
import config from '../config.jsx';
import useStore from '../store';
import { useProfile } from '../hooks/useProfile';
import { partitionCoursesByAge } from '../constants/onboarding';

const MotionCard = motion(Card);

function Library() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { loading, error, get } = useApi();
  const { courseProgress, addNotification } = useStore();
  const { data: profile } = useProfile();
  const toast = useToast();

  const forYou = useMemo(() => {
    if (!profile?.dogAgeBucket || !courses.length) return null;
    return partitionCoursesByAge(courses, profile.dogAgeBucket);
  }, [courses, profile?.dogAgeBucket]);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Тестовые данные
  const testData = [
    {
      id: 1,
      title: 'Основы программирования',
      description: 'Изучите базовые концепции программирования на Python.',
      duration: '8 мин'
    },
    {
      id: 2,
      title: 'Веб-разработка',
      description: 'Погрузитесь в разработку сайтов с использованием HTML, CSS и JavaScript.',
      duration: '12 мин'
    },
    {
      id: 3,
      title: 'Машинное обучениеоооо ооо о о о ооооооо',
      description: 'Научитесь строить модели машинного обучения и анализировать данные.',
      duration: '16 мин'
    },
  ];

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await get(config.api.endpoints.courses);
        setCourses(data);
        setFilteredCourses(data);
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

  useEffect(() => {
    let filtered = courses;

    // Поиск по названию и описанию
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Фильтр по сложности
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedDifficulty]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return 'Не указано';
    }
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
      <VStack spacing={4} align="center" justify="center" height="100vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text fontSize="lg" color={textColor}>Загрузка библиотеки...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={6} align="center" justify="center" height="100vh" p={4}>
        <Box textAlign="center">
          <Icon as={BookOpen} w={12} h={12} color="red.500" mb={4} />
          <Text fontSize="xl" fontWeight="bold" color="red.500" mb={2}>
            Ошибка загрузки
          </Text>
          <Text color={textColor} mb={4}>{error}</Text>
        </Box>
        <Button 
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

        {/* Search and Filters */}
        <Card bg={bg} border="1px solid" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              {/* Search */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={Search} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Поиск в библиотеке..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                />
              </InputGroup>

              {/* Filters */}
              <HStack spacing={4} width="100%">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                >
                  <option value="all">Все категории</option>
                  <option value="obedience">Послушание</option>
                  <option value="tricks">Трюки</option>
                  <option value="behavior">Поведение</option>
                  <option value="training">Обучение</option>
                </Select>

                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                >
                  <option value="all">Любая сложность</option>
                  <option value="beginner">Начинающий</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </Select>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Results Count */}
        <HStack justify="space-between">
          <Text color={textColor}>
            Найдено {filteredCourses.length} программ
          </Text>
          {(searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
            <Button
              size="sm"
              variant="ghost"
              color="purple.500"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </HStack>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <VStack spacing={6} align="center" justify="center" p={8}>
            <Box textAlign="center">
              <Icon as={BookOpen} w={12} h={12} color="gray.400" mb={4} />
              <Text fontSize="xl" fontWeight="bold" color="mutedFg" mb={2}>
                Ничего не найдено
              </Text>
              <Text color={textColor}>
                Попробуйте изменить параметры поиска
              </Text>
            </Box>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredCourses.map((course, index) => (
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
                          <Box
                            p={2}
                            bg="purple.100"
                            borderRadius="full"
                            color="purple.600"
                          >
                            {getCategoryIcon(course.category)}
                          </Box>
                          <Badge
                            colorScheme={getDifficultyColor(course.difficulty)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {getDifficultyText(course.difficulty)}
                          </Badge>
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
                          <HStack spacing={1} color={textColor}>
                            <Icon as={Clock} size={14} />
                            <Text fontSize="xs">
                              {course.duration || 'Не указано'}
                            </Text>
                          </HStack>
                          
                          {course.rating && (
                            <HStack spacing={1} color="yellow.500">
                              <Icon as={Star} size={14} />
                              <Text fontSize="xs">{course.rating}</Text>
                            </HStack>
                          )}
                        </HStack>
                        
                        <Text fontSize="xs" color="purple.600" fontWeight="semibold">
                          {getCategoryText(course.category)}
                        </Text>
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
