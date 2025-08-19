import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  VStack, 
  Text, 
  Button, 
  Spinner, 
  useToast, 
  Collapse, 
  AlertDialog, 
  AlertDialogBody, 
  AlertDialogFooter,
  AlertDialogHeader, 
  AlertDialogContent, 
  AlertDialogOverlay,
  Card,
  CardBody,
  HStack,
  Badge,
  Progress,
  useColorModeValue,
  Icon,
  Heading,
  Box,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  IconButton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Clock, 
  CheckCircle, 
  Play,
  Pause,
  Trash2,
  Plus,
  Calendar,
  Award,
  Zap
} from 'lucide-react';
import TrackCard from './TrackCard';
import config from '../config.jsx';
import useStore from '../store';

const MotionCard = motion(Card);

function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingTask, setLoadingTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const cancelRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { addNotification } = useStore();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await axios.get(`${config.baseUrl}/api/user/tracks`, { withCredentials: true });
        const updatedTracks = response.data.map(track => {
          const remainingTime = getRemainingTime(track.lastCompletedAt);
          return { ...track, remainingTime };
        });
        setTracks(updatedTracks);
      } catch (err) {
        setError('Ошибка при загрузке треков');
      } finally {
        setLoading(false);
      }
    }
    fetchTracks();
  }, []);

  const getRemainingTime = (lastCompletedAt) => {
    if (!lastCompletedAt) return 0;
    const lastCompletedTime = new Date(lastCompletedAt);
    const currentTime = new Date();
    const timeDifference = 15 * 60 * 1000 - (currentTime - lastCompletedTime);
    return timeDifference > 0 ? Math.floor(timeDifference / 1000) : 0;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startTimers = () => {
    const interval = setInterval(() => {
      setTracks((prevTracks) =>
        prevTracks.map((track) => {
          if (track.remainingTime > 0) {
            return { ...track, remainingTime: track.remainingTime - 1 };
          }
          return track;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    const stopTimers = startTimers();
    return stopTimers;
  }, []);

  const completeTask = async (trackId) => {
    setLoadingTask(trackId);
    try {
      const response = await axios.put(`${config.baseUrl}/api/user/tracks/${trackId}`);
      toast({
        title: "Задание выполнено!",
        description: "Отличная работа! Продолжайте в том же духе! 🎉",
        position: "top",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const updatedTracks = tracks.map(track =>
        track.trackId === trackId ? response.data.track : track
      );

      setTracks(updatedTracks);
      
      // Добавляем уведомление
      addNotification({
        title: 'Задание выполнено!',
        message: 'Вы успешно завершили задание. Молодец!',
        type: 'success',
        timestamp: new Date()
      });
    } catch (err) {
      toast({
        title: "Ошибка при выполнении задания.",
        description: "Попробуйте еще раз или обратитесь в поддержку",
        position: "top",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingTask(null);
    }
  };

  const openDeleteConfirmation = (trackId) => {
    setTrackToDelete(trackId);
  };

  const confirmDeleteTask = async () => {
    try {
      await axios.delete(`${config.baseUrl}/api/user/tracks/${trackToDelete}`);
      setTracks(tracks.filter(track => track.trackId !== trackToDelete));
      toast({
        title: "Трек успешно удалён!",
        position: "top",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Ошибка при удалении трека.",
        position: "top",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTrackToDelete(null);
    }
  };

  const openTrackDetails = (track) => {
    setSelectedTrack(track);
    onOpen();
  };

  const getActiveTracksCount = () => {
    return tracks.filter(track => !track.isCompleted).length;
  };

  const getCompletedTracksCount = () => {
    return tracks.filter(track => track.isCompleted).length;
  };

  const getTotalProgress = () => {
    if (tracks.length === 0) return 0;
    const completed = tracks.filter(track => track.isCompleted).length;
    return Math.round((completed / tracks.length) * 100);
  };

  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text fontSize="lg" color={textColor}>Загрузка треков...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={6} align="center" justify="center" height="100vh" p={4}>
        <Box textAlign="center">
          <Icon as={Target} w={12} h={12} color="red.500" mb={4} />
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

  const activeTracks = tracks.filter(track => !track.isCompleted);
  const completedTracks = tracks.filter(track => track.isCompleted);

  return (
    <Box pb={20}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={4} align="stretch">
          <Heading size="lg" color="purple.600">Мои треки</Heading>
          
          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
            <MotionCard
              whileHover={{ scale: 1.02 }}
              bg={bg}
              border="1px solid"
              borderColor={borderColor}
            >
              <CardBody textAlign="center">
                <Icon as={Target} w={6} h={6} color="purple.500" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {getActiveTracksCount()}
                </Text>
                <Text fontSize="sm" color={textColor}>Активных</Text>
              </CardBody>
            </MotionCard>

            <MotionCard
              whileHover={{ scale: 1.02 }}
              bg={bg}
              border="1px solid"
              borderColor={borderColor}
            >
              <CardBody textAlign="center">
                <Icon as={CheckCircle} w={6} h={6} color="green.500" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {getCompletedTracksCount()}
                </Text>
                <Text fontSize="sm" color={textColor}>Завершено</Text>
              </CardBody>
            </MotionCard>

            <MotionCard
              whileHover={{ scale: 1.02 }}
              bg={bg}
              border="1px solid"
              borderColor={borderColor}
            >
              <CardBody textAlign="center">
                <Icon as={Award} w={6} h={6} color="orange.500" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {getTotalProgress()}%
                </Text>
                <Text fontSize="sm" color={textColor}>Прогресс</Text>
              </CardBody>
            </MotionCard>
          </SimpleGrid>

          {/* Overall Progress */}
          <MotionCard
            bg="linear-gradient(135deg, purple.500 0%, purple.600 100%)"
            color="white"
          >
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="semibold">Общий прогресс</Text>
                  <Text fontWeight="bold">{getTotalProgress()}%</Text>
                </HStack>
                <Progress 
                  value={getTotalProgress()} 
                  colorScheme="whiteAlpha" 
                  size="lg" 
                  borderRadius="full"
                  width="100%"
                />
                <Text fontSize="sm" opacity={0.9}>
                  {getCompletedTracksCount()} из {tracks.length} заданий завершено
                </Text>
              </VStack>
            </CardBody>
          </MotionCard>
        </VStack>

        {/* Active Tracks */}
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="purple.600">Активные задания</Heading>
          
          {activeTracks.length === 0 ? (
            <MotionCard
              bg={bg}
              border="1px solid"
              borderColor={borderColor}
            >
              <CardBody textAlign="center">
                <Icon as={Target} w={12} h={12} color="gray.400" mb={4} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.500" mb={2}>
                  Нет активных треков
                </Text>
                <Text color={textColor} mb={4}>
                  Добавьте задания из курсов, чтобы начать обучение
                </Text>
                <Button
                  colorScheme="purple"
                  leftIcon={<Plus size={16} />}
                  onClick={() => window.location.href = '/courses'}
                >
                  Перейти к курсам
                </Button>
              </CardBody>
            </MotionCard>
          ) : (
            <VStack spacing={4} align="stretch">
              {activeTracks.map(track => (
                <MotionCard
                  key={track.trackId}
                  whileHover={{ scale: 1.02 }}
                  bg={bg}
                  border="1px solid"
                  borderColor={borderColor}
                  cursor="pointer"
                  onClick={() => openTrackDetails(track)}
                >
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <HStack justify="space-between" width="100%">
                        <HStack spacing={3}>
                          <Icon as={Target} color="purple.500" />
                          <Text fontWeight="semibold" color="purple.700">
                            {track.title}
                          </Text>
                        </HStack>
                        <Badge colorScheme="purple" variant="subtle">
                          Активно
                        </Badge>
                      </HStack>
                      
                      <Text color={textColor} fontSize="sm" noOfLines={2}>
                        {track.description}
                      </Text>
                      
                      <HStack justify="space-between" width="100%">
                        <HStack spacing={4}>
                          <HStack spacing={1} color={textColor}>
                            <Icon as={Clock} size={14} />
                            <Text fontSize="xs">
                              {track.remainingTime > 0 ? formatTime(track.remainingTime) : 'Готово'}
                            </Text>
                          </HStack>
                          <HStack spacing={1} color={textColor}>
                            <Icon as={Calendar} size={14} />
                            <Text fontSize="xs">
                              {new Date(track.lastCompletedAt).toLocaleDateString()}
                            </Text>
                          </HStack>
                        </HStack>
                        
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="green"
                            leftIcon={<CheckCircle size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              completeTask(track.trackId);
                            }}
                            isLoading={loadingTask === track.trackId}
                          >
                            Завершить
                          </Button>
                          <IconButton
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            icon={<Trash2 size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteConfirmation(track.trackId);
                            }}
                            aria-label="Delete track"
                          />
                        </HStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </VStack>
          )}
        </VStack>

        {/* Completed Tracks */}
        {completedTracks.length > 0 && (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="purple.600">Завершенные задания</Heading>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="purple"
                leftIcon={showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Скрыть' : 'Показать'}
              </Button>
            </HStack>

            <Collapse in={showCompleted}>
              <VStack spacing={4} align="stretch">
                {completedTracks.map(track => (
                  <MotionCard
                    key={track.trackId}
                    bg={bg}
                    border="1px solid"
                    borderColor={borderColor}
                    opacity={0.8}
                  >
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" width="100%">
                          <HStack spacing={3}>
                            <Icon as={CheckCircle} color="green.500" />
                            <Text fontWeight="semibold" color="green.700">
                              {track.title}
                            </Text>
                          </HStack>
                          <Badge colorScheme="green" variant="solid">
                            Завершено
                          </Badge>
                        </HStack>
                        
                        <Text color={textColor} fontSize="sm" noOfLines={2}>
                          {track.description}
                        </Text>
                        
                        <HStack justify="space-between" width="100%">
                          <HStack spacing={4}>
                            <HStack spacing={1} color={textColor}>
                              <Icon as={Calendar} size={14} />
                              <Text fontSize="xs">
                                {new Date(track.lastCompletedAt).toLocaleDateString()}
                              </Text>
                            </HStack>
                          </HStack>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="purple"
                            onClick={() => openTrackDetails(track)}
                          >
                            Подробности
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                ))}
              </VStack>
            </Collapse>
          </VStack>
        )}
      </VStack>

      {/* Track Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Детали задания</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTrack && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="semibold" fontSize="lg">
                    {selectedTrack.title}
                  </Text>
                  <Badge 
                    colorScheme={selectedTrack.isCompleted ? 'green' : 'purple'} 
                    variant="solid"
                  >
                    {selectedTrack.isCompleted ? 'Завершено' : 'Активно'}
                  </Badge>
                </HStack>
                
                <Text color={textColor}>
                  {selectedTrack.description}
                </Text>
                
                <Divider />
                
                <VStack spacing={3} align="start">
                  <HStack justify="space-between" width="100%">
                    <Text fontSize="sm" color={textColor}>Последнее выполнение:</Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {new Date(selectedTrack.lastCompletedAt).toLocaleString()}
                    </Text>
                  </HStack>
                  
                  {!selectedTrack.isCompleted && selectedTrack.remainingTime > 0 && (
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="sm" color={textColor}>Осталось времени:</Text>
                      <Text fontSize="sm" fontWeight="semibold" color="orange.500">
                        {formatTime(selectedTrack.remainingTime)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Закрыть
            </Button>
            {selectedTrack && !selectedTrack.isCompleted && (
              <Button
                colorScheme="green"
                leftIcon={<CheckCircle size={16} />}
                onClick={() => {
                  completeTask(selectedTrack.trackId);
                  onClose();
                }}
                isLoading={loadingTask === selectedTrack.trackId}
              >
                Завершить
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={!!trackToDelete}
        leastDestructiveRef={cancelRef}
        onClose={() => setTrackToDelete(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Подтвердите удаление
            </AlertDialogHeader>
            <AlertDialogBody>
              Вы уверены, что хотите удалить этот трек? Это действие невозможно отменить.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setTrackToDelete(null)}>
                Отмена
              </Button>
              <Button colorScheme="red" onClick={confirmDeleteTask} ml={3}>
                Удалить
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Tracks;
