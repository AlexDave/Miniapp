import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Box, Text, VStack, Spinner, Button } from '@chakra-ui/react';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await axios.get('http://localhost:5000/api/courses', { withCredentials: true });
        setCourses(response.data);
      } catch (err) {
        const message = err.response?.data?.error || 'Не удалось подключиться к серверу';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
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
    <VStack spacing={4} align="stretch" p={4}>
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
        >
          <Text fontSize="xl" fontWeight="medium" color="purple.700">{course.title}</Text>
          <Text mt={2} fontSize="sm" color="purple.600">{course.description}</Text>
        </Box>
      ))}
    </VStack>
  );
}

export default Courses;
