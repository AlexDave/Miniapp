import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ChakraProvider, Box, Flex, IconButton, VStack } from '@chakra-ui/react';
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
        <ScrollToTop /> {/* Компонент для прокрутки наверх */}
        <Flex direction="column" minHeight="100vh">
          {/* Основной контент с отступом снизу для меню */}
          <Box flex="1" overflow="auto" paddingBottom="10vh">
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

// Компонент для прокрутки наверх при изменении маршрута
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Скроллим страницу наверх при каждом изменении маршрута
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

// Компонент для нижней панели навигации
function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation(); // Хук для отслеживания текущего пути

  return (
    <Flex
      as="footer"
      p={4}
      bg="gray.100"
      justify="space-between"
      boxShadow="0px -2px 10px rgba(0, 0, 0, 0.1)"
      borderTop="1px solid #E2E8F0"
      position="fixed"
      bottom="0"
      width="100%"  // Убедитесь, что панель будет занимать всю ширину экрана
      zIndex="10"   // Обеспечивает, что панель будет поверх контента
      height="10vh"  // Высота меню
    >
      {/* Разделы навигации */}
      {[{ path: '/courses', icon: <FaBook />, label: 'Courses' },
        { path: '/tracks', icon: <FaTasks />, label: 'Tracks' },
        { path: '/chat', icon: <FaCommentDots />, label: 'Chat' },
        { path: '/profile', icon: <FaUser />, label: 'Profile' }]
        .map(({ path, icon, label }) => (
          <Flex
            key={label}
            flex="1"
            justify="center"
            align="center"
            p={2}
            _hover={{ bg: 'gray.200' }}
            cursor="pointer"
            onClick={() => navigate(path)}
          >
            <VStack>
              <IconButton
                aria-label={label}
                icon={icon}
                color={location.pathname === path ? 'purple' : 'black'}
                variant="ghost"
                size="lg"
                _hover={{ color: 'purple.800' }}
              />
            </VStack>
          </Flex>
        ))}
    </Flex>
  );
}

export default App;
