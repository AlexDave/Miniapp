import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { 
  ChakraProvider, 
  Box, 
  Flex, 
  IconButton, 
  VStack, 
  Text,
  useColorMode,
  useColorModeValue,
  Container,
  SlideFade,
  Portal
} from '@chakra-ui/react';
import {
  Target,
  User,
  Home,
  Sun,
  Moon,
  Bell,
  Brain,
  PawPrint,
  Map,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import Courses from './components/Courses';
import CourseDetail from './components/CourseDetail';
import Tracks from './components/Tracks';
import RoutesScreen from './components/routes/RoutesScreen';
import Chat from './components/Chat';
import Profile from './components/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import Notifications from './components/Notifications';
import LessonView from './components/lesson/LessonView';
import SkillsScreen from './components/skills/SkillsScreen';
import TrainScreen from './components/train/TrainScreen';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import OnboardingRecommendations from './components/onboarding/OnboardingRecommendations';
import OnboardingGate from './components/onboarding/OnboardingGate';

import theme from './theme';
import useStore from './store';

const MotionBox = motion(Box);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setBackgroundColor('#ffffff');
      window.Telegram.WebApp.setHeaderColor('#6200EE');
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Router>
            <AppContent />
          </Router>
        </ChakraProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { notifications } = useStore();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const toastBg = useColorModeValue('#fff', '#2D3748');
  const toastColor = useColorModeValue('#1A202C', '#E2E8F0');
  const toastBorder = useColorModeValue('#E2E8F0', '#4A5568');
  const hideAppChrome = location.pathname.startsWith('/onboarding');

  return (
    <Flex direction="column" minHeight="100vh" bg={bg}>
      {!hideAppChrome && <Header toggleColorMode={toggleColorMode} colorMode={colorMode} />}

      <Container maxW="container.xl" flex="1" px={4} py={6}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/onboarding/recommendations" element={<OnboardingRecommendations />} />
            <Route
              path="/"
              element={
                <OnboardingGate>
                  <Dashboard />
                </OnboardingGate>
              }
            />
            <Route
              path="/skills"
              element={
                <OnboardingGate>
                  <SkillsScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/train"
              element={
                <OnboardingGate>
                  <TrainScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/courses"
              element={
                <OnboardingGate>
                  <Courses />
                </OnboardingGate>
              }
            />
            <Route
              path="/course/:id"
              element={
                <OnboardingGate>
                  <CourseDetail />
                </OnboardingGate>
              }
            />
            <Route
              path="/lesson/:lessonId"
              element={
                <OnboardingGate>
                  <LessonView />
                </OnboardingGate>
              }
            />
            <Route
              path="/routes"
              element={
                <OnboardingGate>
                  <RoutesScreen />
                </OnboardingGate>
              }
            />
            <Route
              path="/tracks"
              element={
                <OnboardingGate>
                  <Tracks />
                </OnboardingGate>
              }
            />
            <Route
              path="/chat"
              element={
                <OnboardingGate>
                  <Chat />
                </OnboardingGate>
              }
            />
            <Route
              path="/profile"
              element={
                <OnboardingGate>
                  <Profile />
                </OnboardingGate>
              }
            />
          </Routes>
        </AnimatePresence>
      </Container>

      {!hideAppChrome && <BottomNavigation />}
      <Notifications />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: toastBg,
            color: toastColor,
            border: `1px solid ${toastBorder}`,
          },
        }}
      />
    </Flex>
  );
}

function Header({ toggleColorMode, colorMode }) {
  const { notifications } = useStore();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box
      as="header"
      borderBottom="1px solid"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={20}
      backdropFilter="blur(10px)"
      bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
    >
      <Container maxW="container.xl" px={4}>
        <Flex justify="space-between" align="center" py={4}>
          <Flex align="center" gap={3}>
            <Flex
              w={8}
              h={8}
              bg="purple.500"
              borderRadius="full"
              align="center"
              justify="center"
              flexShrink={0}
              aria-hidden
            >
              <PawPrint size={20} color="white" strokeWidth={2} aria-hidden />
            </Flex>
            <Text fontSize="xl" fontWeight="bold" color="purple.600">
              DogCourse
            </Text>
          </Flex>

          <Flex align="center" gap={2}>
            <IconButton
              icon={<Bell size={20} />}
              variant="ghost"
              color={iconColor}
              position="relative"
              onClick={() => useStore.getState().toggleSidebar()}
              aria-label="Notifications"
            >
              {notifications.length > 0 && (
                <Box
                  position="absolute"
                  top={1}
                  right={1}
                  w={3}
                  h={3}
                  bg="red.500"
                  borderRadius="full"
                  fontSize="xs"
                  color="white"
                  display="flex"
                  align="center"
                  justify="center"
                >
                  {notifications.length}
                </Box>
              )}
            </IconButton>
            
            <IconButton
              icon={colorMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              variant="ghost"
              color={iconColor}
              onClick={toggleColorMode}
              aria-label="Toggle color mode"
            />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navigationItems = [
    { path: '/', icon: <Home size={24} />, label: 'Главная', match: (p) => p === '/' },
    { path: '/skills', icon: <Brain size={24} />, label: 'Навыки', match: (p) => p.startsWith('/skills') },
    {
      path: '/train',
      icon: <Target size={24} />,
      label: 'Тренировка',
      match: (p) => p.startsWith('/train') || p.startsWith('/lesson/'),
    },
    { path: '/routes', icon: <Map size={24} />, label: 'Маршрут', match: (p) => p.startsWith('/routes') },
    { path: '/profile', icon: <User size={24} />, label: 'Профиль', match: (p) => p.startsWith('/profile') },
  ];

  return (
    <Box
      as="nav"
      borderTop="1px solid"
      borderColor={borderColor}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={10}
      backdropFilter="blur(10px)"
      bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)')}
    >
      <Flex justify="space-around" align="center" py={2}>
        {navigationItems.map(({ path, icon, label, match }) => {
          const isActive = match ? match(location.pathname) : location.pathname === path;
          const color = isActive ? 'purple.500' : useColorModeValue('gray.500', 'gray.400');
          
          return (
            <MotionBox
              key={label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <VStack
                spacing={1}
                cursor="pointer"
                onClick={() => navigate(path)}
                p={2}
                borderRadius="lg"
                bg={isActive ? 'purple.50' : 'transparent'}
                _hover={{ bg: isActive ? 'purple.100' : 'gray.100' }}
                transition="all 0.2s"
                minW="60px"
              >
                <Box color={color}>
                  {icon}
                </Box>
                <Text 
                  fontSize="xs" 
                  color={color}
                  fontWeight={isActive ? 'semibold' : 'normal'}
                >
                  {label}
                </Text>
              </VStack>
            </MotionBox>
          );
        })}
      </Flex>
    </Box>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

export default App;
