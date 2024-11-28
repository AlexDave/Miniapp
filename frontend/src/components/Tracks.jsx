import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  VStack, Text, Button, Spinner, useToast, Collapse, AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
} from '@chakra-ui/react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import TrackCard from './TrackCard'; // Импортируем TrackCard
import config from '../config.jsx';

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
        position: "top",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const updatedTracks = tracks.map(track =>
        track.trackId === trackId ? response.data.track : track
      );

      setTracks(updatedTracks);
    } catch (err) {
      toast({
        title: "Ошибка при выполнении задания.",
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
        activeTracks.map(track => (
          <TrackCard
            key={track.trackId}
            track={track}
            onComplete={completeTask}
            onDelete={openDeleteConfirmation}
            isLoadingTask={loadingTask}
            formatTime={formatTime}
          />
        ))
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
          <TrackCard
            key={track.trackId}
            track={track}
            onComplete={() => {}}
            onDelete={() => {}}
            isLoadingTask={null}
            formatTime={formatTime}
          />
        ))}
      </Collapse>
    </VStack>
  );
}

export default Tracks;
