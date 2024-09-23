import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Text, Button, Spinner, VStack } from '@chakra-ui/react';

function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await axios.get('http://localhost:5000/api/user/tracks', { withCredentials: true });
        setTracks(response.data);
      } catch (err) {
        setError('Ошибка при загрузке треков');
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, []);

  // Функция для проверки, прошло ли 15 минут с последнего выполнения
  const canPerformTask = (task) => {
    if (!task.lastCompletedAt) return true; // Если задание не выполнялось, можно выполнить сразу
    const lastCompletedTime = new Date(task.lastCompletedAt);
    const currentTime = new Date();
    const timeDifference = Math.floor((currentTime - lastCompletedTime) / 1000 / 60); // Разница в минутах
    return timeDifference >= 15; // Если прошло больше 15 минут, разрешаем выполнить задание
  };

  // Проверка, можно ли выполнить задание
  const canCompleteTaskToday = (task) => {
    const maxCompletionsPerDay = task.requiredPerDay;
    const completionsToday = task.completedToday || 0;
    return completionsToday < maxCompletionsPerDay;
  };

  // Функция для выполнения задания
  const completeTask = async (trackId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/user/tracks/${trackId}`);
      alert('Задание выполнено!');
      // Обновляем состояние треков
      setTracks(tracks.map(track => (track.trackId === trackId ? response.data.track : track)));
    } catch (err) {
      console.error('Ошибка при выполнении задания:', err);
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (tracks.length === 0) {
    return <Text>Треки не найдены.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Ваши треки</Text>
      {tracks.map(track => {
        const canPerform = canPerformTask(track);
        const canCompleteToday = canCompleteTaskToday(track);

        return (
          <Box key={track.trackId} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4}>
            <Text fontSize="xl">{track.title}</Text>
            <Text mt={2}>Осталось выполнений сегодня: {track.completedToday}/{track.requiredPerDay}</Text>
            <Text mt={2}>Осталось дней: {track.daysRemaining}</Text>
            
            <Button
              colorScheme="teal"
              mt={4}
              onClick={() => completeTask(track.trackId)}
              disabled={!canPerform || !canCompleteToday} // Отключаем кнопку, если нельзя выполнить
            >
              {canPerform ? 'Выполнить задание' : 'Подождите 15 минут'}
            </Button>
          </Box>
        );
      })}
    </VStack>
  );
}

export default Tracks;
