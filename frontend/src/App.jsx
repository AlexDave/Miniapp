import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ChakraProvider, Box, Flex, IconButton, VStack } from '@chakra-ui/react'; // Добавлен import для Text
import { FaBook, FaTasks, FaCommentDots, FaUser } from 'react-icons/fa';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import Tracks from './components/Tracks';
import Chat from './components/Chat';
import Profile from './components/Profile';

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
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Box>

          {/* Нижняя панель навигации */}
          <BottomNavigation />
        </Flex>
      </Router>
    </ChakraProvider>
  );
}

// Компонент для нижней панели навигации
function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation(); // Хук для отслеживания текущего пути

  return (
    <Flex
      as="footer"
      p={4}
      bg="gray.100" // Более нейтральный фон
      justify="space-between"
      boxShadow="0px -2px 10px rgba(0, 0, 0, 0.1)" // Мягкая тень для минимализма
      borderTop="1px solid #E2E8F0" // Граница сверху панели
    >
      {/* Раздел "Courses" */}
      <Flex
        flex="1"
        justify="center"
        align="center"
        borderRight="1px solid #E2E8F0" // Граница справа
        p={2} // Увеличиваем кликабельную область
        _hover={{ bg: 'gray.200' }} // Эффект наведения на область
        cursor="pointer" // Указатель при наведении
        onClick={() => navigate('/courses')}
      >
        <VStack>
          <IconButton
            aria-label="Courses"
            icon={<FaBook />}
            color={location.pathname === '/courses' ? 'purple' : 'black'} // Черные иконки, активная фиолетовая
            variant="ghost"
            size="lg"
            _hover={{ color: 'purple.800' }}
          />
        </VStack>
      </Flex>

      {/* Раздел "Tracks" */}
      <Flex
        flex="1"
        justify="center"
        align="center"
        borderRight="1px solid #E2E8F0" // Граница справа
        p={2} // Увеличиваем кликабельную область
        _hover={{ bg: 'gray.200' }} // Эффект наведения на область
        cursor="pointer" // Указатель при наведении
        onClick={() => navigate('/tracks')}
      >
        <VStack>
          <IconButton
            aria-label="Tracks"
            icon={<FaTasks />}
            color={location.pathname === '/tracks' ? 'purple' : 'black'} // Черные иконки, активная фиолетовая
            variant="ghost"
            size="lg"
            _hover={{ color: 'purple.800' }}
          />
        </VStack>
      </Flex>

      {/* Раздел "Chat" */}
      <Flex
        flex="1"
        justify="center"
        align="center"
        borderRight="1px solid #E2E8F0" // Граница справа
        p={2} // Увеличиваем кликабельную область
        _hover={{ bg: 'gray.200' }} // Эффект наведения на область
        cursor="pointer" // Указатель при наведении
        onClick={() => navigate('/chat')}
      >
        <VStack>
          <IconButton
            aria-label="Chat"
            icon={<FaCommentDots />}
            color={location.pathname === '/chat' ? 'purple' : 'black'} // Черные иконки, активная фиолетовая
            variant="ghost"
            size="lg"
            _hover={{ color: 'purple.800' }}
          />
        </VStack>
      </Flex>

      {/* Раздел "Profile" */}
      <Flex
        flex="1"
        justify="center"
        align="center"
        p={2} // Увеличиваем кликабельную область
        _hover={{ bg: 'gray.200' }} // Эффект наведения на область
        cursor="pointer" // Указатель при наведении
        onClick={() => navigate('/profile')}
      >
        <VStack>
          <IconButton
            aria-label="Profile"
            icon={<FaUser />}
            color={location.pathname === '/profile' ? 'purple' : 'black'} // Черные иконки, активная фиолетовая
            variant="ghost"
            size="lg"
            _hover={{ color: 'purple.800' }}
          />
        </VStack>
      </Flex>
    </Flex>
  );
}

export default App;
