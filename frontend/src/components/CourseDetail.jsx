import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonNavState } from '../constants/bottomNav';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  Spinner, 
  VStack, 
  HStack, 
  IconButton, 
  Flex,
  Card,
  CardBody,
  Badge,
  Progress,
  useColorModeValue,
  Icon,
  Divider,
  List,
  ListItem,
  ListIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  AspectRatio,
  SimpleGrid
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  Share2,
  Heart,
  Download,
  MessageCircle
} from 'lucide-react';
import { useCourseLessons } from '../hooks/useLessons';
import { apiClient } from '../hooks/useApi';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const { data: lessons = [], isLoading: lessonsLoading } = useCourseLessons(id);

  /** Все уроки в списке: верхний блок — промо-видео курса (YouTube), не экран урока */
  const lessonNumber = (index) => index + 1;

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await apiClient.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        setError('Не удалось загрузить программу');
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    // Логика для полноэкранного режима
    toast({
      title: 'Полноэкранный режим',
      description: 'Функция в разработке',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: course?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Ссылка скопирована!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleLike = () => {
    toast({
      title: 'Добавлено в избранное!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text fontSize="lg" color={textColor}>Загрузка...</Text>
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
          onClick={() => navigate('/library')}
        >
          Вернуться в библиотеку
        </Button>
      </VStack>
    );
  }

  return (
    <Box pb={20}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <IconButton
              icon={<ArrowLeft size={20} />}
              onClick={() => navigate('/library')}
              colorScheme="purple"
              variant="ghost"
              aria-label="Назад в библиотеку"
            />
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="purple.600">
                {course?.title}
              </Heading>
              <HStack spacing={4}>
                <HStack spacing={1} color={textColor}>
                  <Icon as={Clock} size={16} />
                  <Text fontSize="sm">{course?.duration || 'Не указано'}</Text>
                </HStack>
                {course?.rating && (
                  <HStack spacing={1} color="yellow.500">
                    <Icon as={Star} size={16} />
                    <Text fontSize="sm">{course.rating}</Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            <IconButton
              icon={<Heart size={18} />}
              variant="ghost"
              colorScheme="purple"
              onClick={handleLike}
              aria-label="Добавить в избранное"
            />
            <IconButton
              icon={<Share2 size={18} />}
              variant="ghost"
              colorScheme="purple"
              onClick={handleShare}
              aria-label="Поделиться"
            />
          </HStack>
        </Flex>

        {/* Video Player */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          bg={bg}
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          <AspectRatio ratio={16 / 9}>
            <Box
              bg="black"
              position="relative"
              cursor="pointer"
              onClick={handlePlayPause}
            >
              {(course?.video_url || course?.videoUrl) ? (
                <iframe
                  src={course.video_url || course.videoUrl}
                  title={course.title}
                  frameBorder="0"
                  allowFullScreen
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <Box
                  bg="gray.800"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                >
                  <VStack spacing={4}>
                    <Icon as={Play} size={48} />
                    <Text>Видео недоступно</Text>
                  </VStack>
                </Box>
              )}
              
              {/* Video Controls Overlay */}
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="linear-gradient(transparent, rgba(0,0,0,0.7))"
                p={4}
                opacity={0}
                _hover={{ opacity: 1 }}
                transition="opacity 0.3s"
              >
                <HStack justify="space-between" color="white">
                  <HStack spacing={2}>
                    <IconButton
                      icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      variant="ghost"
                      color="white"
                      onClick={handlePlayPause}
                      size="sm"
                    />
                    <IconButton
                      icon={isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      variant="ghost"
                      color="white"
                      onClick={handleMuteToggle}
                      size="sm"
                    />
                  </HStack>
                  
                  <IconButton
                    icon={<Maximize size={16} />}
                    variant="ghost"
                    color="white"
                    onClick={handleFullscreen}
                    size="sm"
                  />
                </HStack>
              </Box>
            </Box>
          </AspectRatio>
        </MotionCard>

        {/* Course Info */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Main Content */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <VStack spacing={6} align="stretch">
              {/* Description */}
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
              >
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color="purple.600">О программе</Heading>
                    <Text color={textColor} lineHeight="1.6">
                      {course?.description || 'Описание отсутствует'}
                    </Text>
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* Lessons */}
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
              >
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <HStack justify="space-between" width="100%">
                      <Heading size="md" color="purple.600">Уроки</Heading>
                      {lessons.length > 0 && (
                        <Text fontSize="sm" color={textColor}>
                          {lessons.filter((l) => l.is_completed).length}/{lessons.length} выполнено
                        </Text>
                      )}
                    </HStack>
                    {lessonsLoading ? (
                      <Spinner size="sm" color="purple.500" />
                    ) : lessons.length > 0 ? (
                      <VStack spacing={3} align="stretch" width="100%">
                        {lessons.map((lesson, index) => (
                          <Box
                            key={lesson.id}
                            as="button"
                            textAlign="left"
                            p={4}
                            border="1px solid"
                            borderColor={lesson.is_completed ? 'green.300' : borderColor}
                            borderRadius="lg"
                            bg={lesson.is_completed ? useColorModeValue('green.50', 'green.900') : useColorModeValue('gray.50', 'gray.700')}
                            onClick={() => navigate(`/lesson/${lesson.id}`, { state: lessonNavState('/library') })}
                            _hover={{ borderColor: 'purple.400', transform: 'translateY(-1px)', transition: 'all 0.15s' }}
                            w="100%"
                          >
                            <HStack justify="space-between">
                              <HStack spacing={3}>
                                <Box
                                  w={7}
                                  h={7}
                                  borderRadius="full"
                                  bg={lesson.is_completed ? 'green.500' : 'purple.100'}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  flexShrink={0}
                                >
                                  {lesson.is_completed ? (
                                    <Icon as={CheckCircle} w={4} h={4} color="white" />
                                  ) : (
                                    <Text fontSize="xs" fontWeight="bold" color="purple.600">{lessonNumber(index)}</Text>
                                  )}
                                </Box>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold" fontSize="sm">{lesson.title}</Text>
                                  {lesson.description && (
                                    <Text fontSize="xs" color={textColor} noOfLines={1}>{lesson.description}</Text>
                                  )}
                                </VStack>
                              </HStack>
                              <Badge colorScheme={lesson.is_completed ? 'green' : 'purple'} variant="subtle" fontSize="xs">
                                {lesson.is_completed ? '✓' : `+${Math.max(1, Math.floor((lesson.xp_reward ?? 10) / 10))} 🦴`}
                              </Badge>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text color={textColor} fontSize="sm">Уроки появятся скоро</Text>
                    )}
                  </VStack>
                </CardBody>
              </MotionCard>
            </VStack>
          </Box>

          {/* Sidebar */}
          <Box>
            <VStack spacing={4} align="stretch">
              {/* Course Stats */}
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
              >
                <CardBody>
                  <VStack spacing={4}>
                    <Heading size="sm" color="purple.600">Статистика</Heading>
                    
                    <VStack spacing={3} width="100%">
                      <HStack justify="space-between" width="100%">
                        <Text fontSize="sm" color={textColor}>Прогресс</Text>
                        <Text fontSize="sm" color="purple.600" fontWeight="semibold">
                          {progress}%
                        </Text>
                      </HStack>
                      <Progress 
                        value={progress} 
                        colorScheme="purple" 
                        size="sm" 
                        borderRadius="full"
                        width="100%"
                      />
                    </VStack>
                    
                    <Divider />
                    
                    <VStack spacing={2} align="start" width="100%">
                      <HStack justify="space-between" width="100%">
                        <Text fontSize="sm" color={textColor}>Заданий</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {course?.tasks?.length || 0}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between" width="100%">
                        <Text fontSize="sm" color={textColor}>Длительность</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {course?.duration || 'Не указано'}
                        </Text>
                      </HStack>
                      
                      <HStack justify="space-between" width="100%">
                        <Text fontSize="sm" color={textColor}>Сложность</Text>
                        <Badge colorScheme="green" variant="subtle">
                          Начинающий
                        </Badge>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* Quick Actions */}
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                bg={bg}
                border="1px solid"
                borderColor={borderColor}
              >
                <CardBody>
                  <VStack spacing={3}>
                    <Heading size="sm" color="purple.600">Быстрые действия</Heading>
                    
                    <Button
                      size="sm"
                      colorScheme="purple"
                      width="100%"
                      leftIcon={<Download size={16} />}
                    >
                      Скачать материалы
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      width="100%"
                      leftIcon={<MessageCircle size={16} />}
                    >
                      Задать вопрос
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      width="100%"
                      leftIcon={<Share2 size={16} />}
                      onClick={handleShare}
                    >
                      Поделиться
                    </Button>
                  </VStack>
                </CardBody>
              </MotionCard>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}

export default CourseDetail;
