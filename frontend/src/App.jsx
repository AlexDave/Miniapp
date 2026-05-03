import React, { useEffect, lazy, Suspense } from 'react';
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
  VStack,
  Text,
  Spinner,
  useColorMode,
  useColorModeValue,
  Container,
  SlideFade,
  Portal,
} from '@chakra-ui/react';
import {
  Target,
  User,
  Home,
  Brain,
  Map,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import ErrorBoundary from './components/ErrorBoundary';
import SiteHeader from './components/layout/SiteHeader';
import Notifications from './components/Notifications';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import OnboardingGate from './components/onboarding/OnboardingGate';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Courses = lazy(() => import('./components/Courses'));
const CourseDetail = lazy(() => import('./components/CourseDetail'));
const Tracks = lazy(() => import('./components/Tracks'));
const RoutesScreen = lazy(() => import('./components/routes/RoutesScreen'));
const Chat = lazy(() => import('./components/Chat'));
const Profile = lazy(() => import('./components/Profile'));
const LessonView = lazy(() => import('./components/lesson/LessonView'));
const SkillsScreen = lazy(() => import('./components/skills/SkillsScreen'));
const TrainScreen = lazy(() => import('./components/train/TrainScreen'));
const OnboardingRecommendations = lazy(() => import('./components/onboarding/OnboardingRecommendations'));

import theme from './theme';
import useStore from './store';

const MotionBox = motion(Box);

function PageSpinner() {
  return (
    <Flex justify="center" align="center" minH="50vh" py={12}>
      <VStack spacing={3}>
        <Spinner size="lg" color="purple.500" thickness="4px" />
        <Text fontSize="sm" color="gray.500">Загрузка…</Text>
      </VStack>
    </Flex>
  );
}

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
      {!hideAppChrome && <SiteHeader toggleColorMode={toggleColorMode} colorMode={colorMode} />}

      <Container maxW="container.xl" flex="1" px={4} py={6}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageSpinner />}>
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
          </Suspense>
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

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');
  const activeItemBg = useColorModeValue('purple.50', 'purple.900');
  const activeItemHoverBg = useColorModeValue('purple.100', 'purple.800');
  const inactiveItemHoverBg = useColorModeValue('gray.100', 'gray.700');

  const navigationItems = [
    { path: '/', icon: <Home size={24} />, label: 'Главная', match: (p) => p === '/' },
    { path: '/skills', icon: <Brain size={24} />, label: 'Навыки', match: (p) => p.startsWith('/skills') },
    {
      path: '/train',
      icon: <Target size={24} />,
      label: 'Тренировка',
      match: (p) => p.startsWith('/train') || p.startsWith('/lesson/'),
    },
    { path: '/routes', icon: <Map size={24} />, label: 'Маршруты', match: (p) => p.startsWith('/routes') },
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
      bg={navBg}
    >
      <Flex justify="space-around" align="center" py={2}>
        {navigationItems.map(({ path, icon, label, match }) => {
          const isActive = match ? match(location.pathname) : location.pathname === path;
          const color = isActive ? 'purple.500' : inactiveColor;

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
                bg={isActive ? activeItemBg : 'transparent'}
                _hover={{ bg: isActive ? activeItemHoverBg : inactiveItemHoverBg }}
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
