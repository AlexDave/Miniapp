import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Button, Spinner, VStack } from '@chakra-ui/react';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tracks, setTracks] = useState([]); // Треки пользователя

  useEffect(() => {
    // Функция для получения курса
    async function fetchCourse() {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        setError('Ошибка при загрузке курса');
      } finally {
        setLoading(false);
      }
    }

    // Функция для получения треков пользователя
    async function fetchUserTracks() {
      try {
        const response = await axios.get('http://localhost:5000/api/user/tracks', { withCredentials: true });
        setTracks(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке треков пользователя:', err);
      }
    }

    fetchCourse();
    fetchUserTracks();
  }, [id]);

  // Функция для добавления задания в треки пользователя
  const addTaskToTracks = async (task) => {
    try {
      const response = await axios.post('http://localhost:5000/api/user/tracks', { track: task });
      setTracks([...tracks, task]); // Обновляем список треков
      alert('Задание добавлено в ваши треки');
    } catch (err) {
      console.error('Ошибка при добавлении трека:', err);
    }
  };

  // Проверяем, добавлено ли задание в треки
  const isTaskInTracks = (task) => {
    return tracks.some(track => track.trackId === task.trackId);
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      {course ? (
        <>
          <Heading size="lg">{course.title}</Heading>
          
          {/* Видео лекции */}
          <Box as="iframe"
               width="100%"
               height="400px"
               src={course.videoUrl}
               title={course.title}
               frameBorder="0"
               allowFullScreen
               mb={4}
          />

          {/* Описание курса */}
          <Text fontSize="md" mb={4}>{course.content}</Text>

          {/* Отображение заданий курса */}
          <Heading size="md" mt={4}>Задания курса:</Heading>
          {course.tasks && course.tasks.length > 0 ? (
            course.tasks.map(task => (
              <Box key={task.trackId} p={4} borderWidth="1px" borderRadius="lg" mb={4}>
                <Heading size="sm">{task.title}</Heading>
                <Text mt={2}>{task.description}</Text>

                {/* Проверка на наличие задания в треках */}
                {isTaskInTracks(task) ? (
                  <Text color="green.500" mt={4}>Задание уже добавлено в ваши треки</Text>
                ) : (
                  <Button colorScheme="teal" mt={4} onClick={() => addTaskToTracks(task)}>
                    Добавить в треки
                  </Button>
                )}
              </Box>
            ))
          ) : (
            <Text>Заданий нет</Text>
          )}

          {/* Дополнительные действия */}
          <Button colorScheme="teal" mt={4}>
            Записаться на курс
          </Button>
        </>
      ) : (
        <Text>Курс не найден</Text>
      )}
    </VStack>
  );
}

export default CourseDetail;
