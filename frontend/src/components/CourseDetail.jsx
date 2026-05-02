import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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
  Target,
  CheckCircle,
  Plus,
  Share2,
  Heart,
  Download,
  MessageCircle
} from 'lucide-react';
import config from '../config.jsx';
import useStore from '../store';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addTrack, addNotification } = useStore();
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await axios.get(`${config.baseUrl}/api/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        setError('Ошибка при загрузке курса');
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserTracks() {
      try {
        const response = await axios.get(`${config.baseUrl}/api/user/tracks`, { withCredentials: true });
        setTracks(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке треков пользователя:', err);
      }
    }

    fetchCourse();
    fetchUserTracks();
  }, [id]);

  const addTaskToTracks = async (task) => {
    try {
      await axios.post(`${config.baseUrl}/api/user/tracks`, { track_id: task.id });
      setTracks((prevTracks) => [...prevTracks, task]);
      toast({
        title: 'Задание добавлено!',
        description: 'Задание добавлено в ваши треки',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Не удалось добавить задание';
      toast({ title: 'Ошибка', description: msg, status: 'error', duration: 3000, isClosable: true });
    }
  };

  const isTaskInTracks = (task) => {
    return tracks.some((track) => track.id === task.id);
  };

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
      title: 'Курс добавлен в избранное!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text fontSize="lg" color={textColor}>Загрузка курса...</Text>
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
          onClick={() => navigate('/courses')}
        >
          Вернуться к курсам
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
              onClick={() => navigate('/courses')}
              colorScheme="purple"
              variant="ghost"
              aria-label="Назад к курсам"
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
              {course?.videoUrl ? (
                <iframe
                  src={course.videoUrl}
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
                    <Heading size="md" color="purple.600">Описание курса</Heading>
                    <Text color={textColor} lineHeight="1.6">
                      {course?.description || 'Описание курса отсутствует'}
                    </Text>
                  </VStack>
                </CardBody>
              </MotionCard>

              {/* Tasks */}
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
                    <Heading size="md" color="purple.600">Задания курса</Heading>
                    
                    {course?.tasks && course.tasks.length > 0 ? (
                      <VStack spacing={4} align="stretch" width="100%">
                        {course.tasks.map((task, index) => (
                          <Box
                            key={task.trackId}
                            p={4}
                            border="1px solid"
                            borderColor={borderColor}
                            borderRadius="lg"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                          >
                            <VStack align="start" spacing={3}>
                              <HStack justify="space-between" width="100%">
                                <HStack spacing={2}>
                                  <Icon as={Target} color="purple.500" />
                                  <Text fontWeight="semibold" color="purple.700">
                                    Задание {index + 1}
                                  </Text>
                                </HStack>
                                {isTaskInTracks(task) && (
                                  <Badge colorScheme="green" variant="solid">
                                    <HStack spacing={1}>
                                      <Icon as={CheckCircle} size={12} />
                                      <Text>Добавлено</Text>
                                    </HStack>
                                  </Badge>
                                )}
                              </HStack>
                              
                              <Text fontWeight="semibold" color="purple.700">
                                {task.title}
                              </Text>
                              
                              <Text color={textColor} fontSize="sm">
                                {task.description}
                              </Text>
                              
                              {!isTaskInTracks(task) && (
                                <Button
                                  size="sm"
                                  colorScheme="purple"
                                  leftIcon={<Plus size={16} />}
                                  onClick={() => addTaskToTracks(task)}
                                >
                                  Добавить в треки
                                </Button>
                              )}
                            </VStack>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Text color={textColor}>Заданий для этого курса пока нет</Text>
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
                    <Heading size="sm" color="purple.600">Статистика курса</Heading>
                    
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
