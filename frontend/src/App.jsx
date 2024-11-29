import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { ChakraProvider, Box, Flex, IconButton, VStack } from '@chakra-ui/react';
import { FaBook, FaTasks } from 'react-icons/fa';
import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import Tracks from './components/Tracks';
import Chat from './components/Chat';
import Profile from './components/Profile';

function App() {
  useEffect(() => {
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      // Можно настроить настройки Telegram WebApp, например, закрыть меню или изменить стиль
      window.Telegram.WebApp.setBackgroundColor('#ffffff');
      window.Telegram.WebApp.setHeaderColor('#6200EE');
    }
  }, []);

  return (
    <ChakraProvider>
      <Router>
        <ScrollToTop />
        <Flex direction="column" minHeight="100vh">
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

          <BottomNavigation />
        </Flex>
      </Router>
    </ChakraProvider>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

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
      width="100%"
      zIndex="10"
      height="10vh"
    >
      {[{ path: '/courses', icon: <FaBook />, label: 'Courses' },
        { path: '/tracks', icon: <FaTasks />, label: 'Tracks' }]
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
