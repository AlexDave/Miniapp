import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Box, Text, VStack, Spinner, Button, Flex } from '@chakra-ui/react';
import config from '../config.jsx'; // Импортируем конфигурацию

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const response = await axios.get(`${config.baseUrl}/api/courses`, { withCredentials: true });
        setCourses(response.data);
      } catch (err) {
        const message = err.response?.data?.error || 'Не удалось подключиться к серверу';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    // Используем тестовые данные для демонстрации
    // fetchCourses(); // Раскомментируйте для работы с API
    setCourses(testData); // Тестовые данные
    setLoading(false); // Для демонстрации убираем "загрузка"
  }, []);

  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100vh">
        <Spinner size="xl" color="purple.500" />
        <Text>Загрузка курсов...</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100vh">
        <Text color="red.500">{error}</Text>
        <Button as={Link} to="/" colorScheme="purple" variant="outline">
          Вернуться на главную
        </Button>
      </VStack>
    );
  }

  if (courses.length === 0) {
    return (
      <VStack spacing={4} align="center" justify="center" height="100vh">
        <Text>Курсы не найдены.</Text>
        <Button as={Link} to="/" colorScheme="purple" variant="outline">
          Вернуться на главную
        </Button>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} align="stretch" p={4}>
      {courses.map(course => (
        <Box
          key={course.id}
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          as={Link}
          to={`/course/${course.id}`}
          _hover={{ bg: 'purple.50' }}
          transition="background-color 0.2s"
          borderColor="purple.500"
          position="relative"
          overflow="visible" // Обеспечивает видимость выпирающей части
          zIndex={2}
        >
          {/* Колба с информацией */}
          <Box
            position="absolute"
            top="5px" // Поднимаем над карточкой
            right="-4%"
            transform="translateX(-50%)"
            w="50px"
            h="50px"
            bg="purple.600"
            borderRadius="30px"
            border="1px solid rgba(128, 90, 213, 0.5)"
            boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
            zIndex={2} // Обеспечивает поверхностный слой
          >
            <Text fontSize="xs" color="white">{course.duration}</Text>
          </Box>

          {/* Содержимое карточки */}
          <Box mt="30px">
            <Text fontSize="xl" fontWeight="medium" color="purple.700">{course.title}</Text>
            <Text mt={2} fontSize="sm" color="purple.600">{course.description}</Text>
          </Box>
        </Box>
      ))}
    </VStack>
  );
}

export default Courses;
