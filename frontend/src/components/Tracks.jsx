import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box, Text, Button, Spinner, VStack, IconButton, Progress, useToast, HStack, Collapse, AlertDialog,
  AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';
import { FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingTask, setLoadingTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState(null); 
  const cancelRef = useRef(); 
  const toast = useToast();

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await axios.get('http://localhost:5000/api/user/tracks', { withCredentials: true });
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

  const completeTask = async (trackId) => {
    setLoadingTask(trackId);
    try {
      const response = await axios.put(`http://localhost:5000/api/user/tracks/${trackId}`);
      toast({
        title: "Задание выполнено!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const updatedTracks = tracks.map(track => {
        if (track.trackId === trackId) {
          let updatedTrack = response.data.track;

          if (updatedTrack.completedToday >= updatedTrack.requiredPerDay) {
            updatedTrack = { 
              ...updatedTrack, 
              daysRemaining: Math.max(updatedTrack.daysRemaining - 1, 0), 
              completedToday: 0 
            };
          }

          if (updatedTrack.daysRemaining === 0 && updatedTrack.completedToday >= updatedTrack.requiredPerDay) {
            updatedTrack.isCompleted = true;
            axios.put(`http://localhost:5000/api/user/tracks/${trackId}`, { isCompleted: true });
          }

          return updatedTrack;
        }
        return track;
      });

      setTracks(updatedTracks);
    } catch (err) {
      toast({
        title: "Ошибка при выполнении задания.",
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
      await axios.delete(`http://localhost:5000/api/user/tracks/${trackToDelete}`);
      setTracks(tracks.filter(track => track.trackId !== trackToDelete));
      toast({
        title: "Трек успешно удалён!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Ошибка при удалении трека.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTrackToDelete(null); 
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  const activeTracks = tracks.filter(track => !track.isCompleted);
  const completedTracks = tracks.filter(track => track.isCompleted);

  return (
    <VStack spacing={4} align="stretch" p={4}>

      {activeTracks.length === 0 ? (
        <Text>Нет активных треков.</Text>
      ) : (
        activeTracks.map(track => {
          const remainingTime = track.remainingTime || 0;
          const canPerform = remainingTime === 0;
          const completionProgress = (track.completedToday / track.requiredPerDay) * 100;
          const daysProgress = ((track.totalDays - track.daysRemaining) / track.totalDays) * 100;

          return (
            <Box key={track.trackId} borderWidth="1px" borderRadius="lg" overflow="hidden" p={3}>
              <VStack spacing={2} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">{track.title}</Text>

                <Text fontSize="sm">Прогресс выполнения заданий:</Text>
                <Progress value={completionProgress} colorScheme="purple" size="sm" bg="purple.200"/>
                <Text fontSize="xs" mt={1}>
                  Выполнено {track.completedToday} из {track.requiredPerDay} заданий на сегодня
                </Text>

                <Text fontSize="sm" mt={2}>Прогресс времени:</Text>
                <Progress value={daysProgress} colorScheme="orange" size="sm" variant="solid" bg="purple.200" />
                <Text fontSize="xs" mt={1}>
                  Осталось {track.daysRemaining} из {track.totalDays} дней
                </Text>

                <HStack justifyContent="space-between" height="40px">
                  {!track.isCompleted && (
                    <Button
                      colorScheme="green"
                      size="xs"
                      width="33%"
                      height="100%"
                      onClick={() => completeTask(track.trackId)}
                      isLoading={loadingTask === track.trackId}
                      disabled={!canPerform || loadingTask === track.trackId}
                    >
                      {canPerform ? 'Выполнить' : `Ждите ${formatTime(remainingTime)}`}
                    </Button>
                  )}

                  <IconButton
                    aria-label="Удалить трек"
                    icon={<FaTrash />}
                    colorScheme="red"
                    size="sm"
                    height="100%"
                    onClick={() => openDeleteConfirmation(track.trackId)}
                  />
                </HStack>
              </VStack>
            </Box>
          );
        })
      )}

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

      {completedTracks.length > 0 && (
        <Button
          onClick={() => setShowCompleted(!showCompleted)}
          size="sm"
          mt={4}
          leftIcon={showCompleted ? <FaChevronUp /> : <FaChevronDown />}
        >
          {showCompleted ? 'Скрыть выполненные' : 'Показать выполненные'}
        </Button>
      )}

      <Collapse in={showCompleted}>
        <Text fontSize="lg" fontWeight="bold" mt={4}>Выполненные</Text>
        {completedTracks.map(track => (
          <Box key={track.trackId} borderWidth="1px" borderRadius="lg" overflow="hidden" p={3} bg="gray.100">
            <Text fontSize="lg" fontWeight="semibold">{track.title}</Text>
          </Box>
        ))}
      </Collapse>
    </VStack>
  );
}

export default Tracks;
