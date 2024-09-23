import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Box, Text, VStack, Spinner } from '@chakra-ui/react';

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
        // Добавляем более детализированное сообщение об ошибке
        const message = err.response?.data?.error || 'Ошибка при загрузке курсов';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (courses.length === 0) {
    return <Text>Курсы не найдены.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Курсы</Text>
      {courses.map(course => (
        <Box
          key={course.id}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          p={4}
          as={Link}
          to={`/course/${course.id}`}
          _hover={{ bg: 'teal.50' }}
        >
          <Text fontSize="xl">{course.title}</Text>
          <Text mt={2}>{course.description}</Text>
        </Box>
      ))}
    </VStack>
  );
}

export default Courses;
