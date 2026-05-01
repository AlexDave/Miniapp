import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  Target,
  Clock,
  CheckCircle,
  Trash2,
  Plus,
  Calendar,
  Award,
} from 'lucide-react';
import { useTracks, useCompleteTrack, useDeleteTrack } from '../hooks/useTracks';
import useStore from '../store';

const MotionCard = motion(Card);

function getRemainingSeconds(lastCompletedAt) {
  if (!lastCompletedAt) return 0;
  const elapsed = Date.now() - new Date(lastCompletedAt).getTime();
  const remaining = 15 * 60 * 1000 - elapsed;
  return remaining > 0 ? Math.floor(remaining / 1000) : 0;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function Tracks() {
  const { data: userTracks = [], isLoading, isError } = useTracks();
  const completeTrack = useCompleteTrack();
  const deleteTrack = useDeleteTrack();

  const [timers, setTimers] = useState({});
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

  // Инициализируем таймеры из данных сервера
  useEffect(() => {
    const initial = {};
    userTracks.forEach((ut) => {
      initial[ut.track_id] = getRemainingSeconds(ut.last_completed_at);
    });
    setTimers(initial);
  }, [userTracks]);

  // Тикаем каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) next[id] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = async (trackId) => {
    try {
      await completeTrack.mutateAsync(trackId);
      toast({
        title: 'Задание выполнено!',
        description: 'Отличная работа! 🎉',
        position: 'top',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      addNotification({ title: 'Задание выполнено!', message: 'Молодец!', type: 'success' });
    } catch (err) {
      toast({
        title: err?.response?.data?.error || 'Ошибка при выполнении задания',
        position: 'top',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTrack.mutateAsync(trackToDelete);
      toast({ title: 'Трек удалён', position: 'top', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Ошибка при удалении трека', position: 'top', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setTrackToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="60vh" direction="column" gap={4}>
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text color={textColor}>Загрузка треков...</Text>
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" align="center" height="60vh" direction="column" gap={4} p={4}>
        <Icon as={Target} w={12} h={12} color="red.500" />
        <Text fontSize="xl" fontWeight="bold" color="red.500">Ошибка загрузки</Text>
        <Button colorScheme="purple" variant="outline" onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </Flex>
    );
  }

  const activeTracks = userTracks.filter((t) => !t.is_completed);
  const completedTracks = userTracks.filter((t) => t.is_completed);

  const getTotalProgress = () => {
    if (userTracks.length === 0) return 0;
    return Math.round((completedTracks.length / userTracks.length) * 100);
  };

  return (
    <Box pb={20}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack spacing={4} align="stretch">
          <Heading size="lg" color="purple.600">Мои треки</Heading>

          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
            <MotionCard whileHover={{ scale: 1.02 }} bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={Target} w={6} h={6} color="purple.500" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">{activeTracks.length}</Text>
                <Text fontSize="sm" color={textColor}>Активных</Text>
              </CardBody>
            </MotionCard>

            <MotionCard whileHover={{ scale: 1.02 }} bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={CheckCircle} w={6} h={6} color="green.500" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="green.600">{completedTracks.length}</Text>
                <Text fontSize="sm" color={textColor}>Завершено</Text>
              </CardBody>
            </MotionCard>

            <MotionCard whileHover={{ scale: 1.02 }} bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={Award} w={6} h={6} color="orange.500" mb={2} />
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">{getTotalProgress()}%</Text>
                <Text fontSize="sm" color={textColor}>Прогресс</Text>
              </CardBody>
            </MotionCard>
          </SimpleGrid>

          <MotionCard bg="purple.500" color="white">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="semibold">Общий прогресс</Text>
                  <Text fontWeight="bold">{getTotalProgress()}%</Text>
                </HStack>
                <Progress value={getTotalProgress()} colorScheme="whiteAlpha" size="lg" borderRadius="full" width="100%" />
                <Text fontSize="sm" opacity={0.9}>
                  {completedTracks.length} из {userTracks.length} заданий завершено
                </Text>
              </VStack>
            </CardBody>
          </MotionCard>
        </VStack>

        {/* Active Tracks */}
        <VStack spacing={4} align="stretch">
          <Heading size="md" color="purple.600">Активные задания</Heading>

          {activeTracks.length === 0 ? (
            <MotionCard bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={Target} w={12} h={12} color="gray.400" mb={4} />
                <Text fontSize="lg" fontWeight="semibold" color="gray.500" mb={2}>Нет активных треков</Text>
                <Text color={textColor} mb={4}>Добавьте задания из курсов, чтобы начать обучение</Text>
                <Button colorScheme="purple" leftIcon={<Plus size={16} />} onClick={() => (window.location.href = '/courses')}>
                  Перейти к курсам
                </Button>
              </CardBody>
            </MotionCard>
          ) : (
            <VStack spacing={4} align="stretch">
              {activeTracks.map((ut) => {
                const remaining = timers[ut.track_id] ?? 0;
                const canComplete = remaining === 0;

                return (
                  <MotionCard
                    key={ut.id}
                    whileHover={{ scale: 1.02 }}
                    bg={bg}
                    border="1px solid"
                    borderColor={borderColor}
                    cursor="pointer"
                    onClick={() => { setSelectedTrack(ut); onOpen(); }}
                  >
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" width="100%">
                          <HStack spacing={3}>
                            <Icon as={Target} color="purple.500" />
                            <Text fontWeight="semibold" color="purple.700">{ut.track.title}</Text>
                          </HStack>
                          <Badge colorScheme="purple" variant="subtle">Активно</Badge>
                        </HStack>

                        <Text color={textColor} fontSize="sm" noOfLines={2}>{ut.track.description}</Text>

                        <HStack justify="space-between" width="100%">
                          <HStack spacing={4}>
                            <HStack spacing={1} color={remaining > 0 ? 'orange.500' : 'green.500'}>
                              <Icon as={Clock} size={14} />
                              <Text fontSize="xs" fontWeight="semibold">
                                {remaining > 0 ? formatTime(remaining) : 'Готово'}
                              </Text>
                            </HStack>
                            <HStack spacing={1} color={textColor}>
                              <Icon as={Calendar} size={14} />
                              <Text fontSize="xs">{ut.days_remaining} дн. осталось</Text>
                            </HStack>
                          </HStack>

                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<CheckCircle size={14} />}
                              onClick={(e) => { e.stopPropagation(); handleComplete(ut.track_id); }}
                              isLoading={completeTrack.isLoading && completeTrack.variables === ut.track_id}
                              isDisabled={!canComplete}
                            >
                              Выполнить
                            </Button>
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              icon={<Trash2 size={14} />}
                              onClick={(e) => { e.stopPropagation(); setTrackToDelete(ut.track_id); }}
                              aria-label="Удалить трек"
                            />
                          </HStack>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </MotionCard>
                );
              })}
            </VStack>
          )}
        </VStack>

        {/* Completed Tracks */}
        {completedTracks.length > 0 && (
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md" color="purple.600">Завершённые задания</Heading>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="purple"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Скрыть' : 'Показать'}
              </Button>
            </HStack>

            <Collapse in={showCompleted}>
              <VStack spacing={4} align="stretch">
                {completedTracks.map((ut) => (
                  <MotionCard key={ut.id} bg={bg} border="1px solid" borderColor={borderColor} opacity={0.8}>
                    <CardBody>
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Icon as={CheckCircle} color="green.500" />
                          <Text fontWeight="semibold" color="green.700">{ut.track.title}</Text>
                        </HStack>
                        <Badge colorScheme="green" variant="solid">Завершено</Badge>
                      </HStack>
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
                  <Text fontWeight="semibold" fontSize="lg">{selectedTrack.track.title}</Text>
                  <Badge colorScheme={selectedTrack.is_completed ? 'green' : 'purple'} variant="solid">
                    {selectedTrack.is_completed ? 'Завершено' : 'Активно'}
                  </Badge>
                </HStack>
                <Text color={textColor}>{selectedTrack.track.description}</Text>
                <Divider />
                <VStack spacing={3} align="start">
                  <HStack justify="space-between" width="100%">
                    <Text fontSize="sm" color={textColor}>Осталось дней:</Text>
                    <Text fontSize="sm" fontWeight="semibold">{selectedTrack.days_remaining}</Text>
                  </HStack>
                  {selectedTrack.last_completed_at && (
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="sm" color={textColor}>Последнее выполнение:</Text>
                      <Text fontSize="sm" fontWeight="semibold">
                        {new Date(selectedTrack.last_completed_at).toLocaleString()}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Закрыть</Button>
            {selectedTrack && !selectedTrack.is_completed && (timers[selectedTrack.track_id] ?? 0) === 0 && (
              <Button
                colorScheme="green"
                leftIcon={<CheckCircle size={16} />}
                onClick={() => { handleComplete(selectedTrack.track_id); onClose(); }}
                isLoading={completeTrack.isLoading}
              >
                Выполнить
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={!!trackToDelete} leastDestructiveRef={cancelRef} onClose={() => setTrackToDelete(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Подтвердите удаление</AlertDialogHeader>
            <AlertDialogBody>Вы уверены? Это действие невозможно отменить.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setTrackToDelete(null)}>Отмена</Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                isLoading={deleteTrack.isLoading}
                ml={3}
              >
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
