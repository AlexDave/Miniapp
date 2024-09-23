import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ChakraProvider, Box, Flex, IconButton, Spacer } from '@chakra-ui/react';
import { FaBook, FaTasks, FaCommentDots, FaUser } from 'react-icons/fa';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import Tracks from './components/Tracks';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Flex direction="column" height="100vh">
          {/* Основной контент */}
          <Box flex="1" overflow="auto">
            <Routes>
              <Route path="/" element={<Courses />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/tracks" element={<Tracks />} />
            </Routes>
          </Box>

          {/* Нижняя панель навигации */}
          <Flex as="footer" p={4} bg="teal.500" justify="space-between">
            <IconButton
              aria-label="Courses"
              icon={<FaBook />}
              colorScheme="teal"
              variant="ghost"
              size="lg"
              onClick={() => window.location.href = "/courses"}
            />
            <IconButton
              aria-label="Tracks"
              icon={<FaTasks />}
              colorScheme="teal"
              variant="ghost"
              size="lg"
              onClick={() => window.location.href = "/tracks"}
            />
            <IconButton
              aria-label="Chat"
              icon={<FaCommentDots />}
              colorScheme="teal"
              variant="ghost"
              size="lg"
              onClick={() => window.location.href = "/chat"}
            />
            <IconButton
              aria-label="Profile"
              icon={<FaUser />}
              colorScheme="teal"
              variant="ghost"
              size="lg"
              onClick={() => window.location.href = "/profile"}
            />
          </Flex>
        </Flex>
      </Router>
    </ChakraProvider>
  );
}

export default App;
