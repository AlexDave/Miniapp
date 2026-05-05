import React, { useEffect, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
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
} from '@chakra-ui/react';
import { Home, Brain, BookOpen, User } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, useReducedMotion } from 'framer-motion';
import ReducedMotionAnimatePresence from './motion/ReducedMotionAnimatePresence';

import ErrorBoundary from './components/ErrorBoundary';
import SiteHeader from './components/layout/SiteHeader';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import OnboardingGate from './components/onboarding/OnboardingGate';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Library = lazy(() => import('./components/Library'));
const CourseDetail = lazy(() => import('./components/CourseDetail'));
const RoutesScreen = lazy(() => import('./components/routes/RoutesScreen'));
const Chat = lazy(() => import('./components/Chat'));
const Profile = lazy(() => import('./components/Profile'));
const LessonView = lazy(() => import('./components/lesson/LessonView'));
const SkillsScreen = lazy(() => import('./components/skills/SkillsScreen'));
import theme from './theme';
import { BOTTOM_TAB_STATE_KEY } from './constants/bottomNav';

const MotionBox = motion(Box);

function PageSpinner() {
  return (
    <Flex justify="center" align="center" minH="50vh" py={12}>
      <VStack spacing={3}>
        <Spinner size="lg" color="purple.500" thickness="4px" />
        <Text fontSize="sm" color="mutedFg">Загрузка…</Text>
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
  const bg = useColorModeValue('gray.50', 'gray.900');
  const toastBg = useColorModeValue('#fff', '#2D3748');
  const toastColor = useColorModeValue('#1A202C', '#E2E8F0');
  const toastBorder = useColorModeValue('#E2E8F0', '#4A5568');
  const hideAppChrome = location.pathname.startsWith('/onboarding');

  return (
    <Flex direction="column" minHeight="100vh" bg={bg}>
      {!hideAppChrome && <SiteHeader toggleColorMode={toggleColorMode} colorMode={colorMode} />}

      <Container maxW="container.xl" flex="1" px={4} py={6}>
        <ReducedMotionAnimatePresence mode="wait">
          <Suspense fallback={<PageSpinner />}>
            <Routes>
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/onboarding/recommendations" element={<Navigate to="/" replace />} />
            <Route path="/courses" element={<Navigate to="/library" replace />} />
            <Route path="/train" element={<Navigate to="/" replace />} />
            <Route path="/tracks" element={<Navigate to="/" replace />} />
            <Route path="/routes" element={<Navigate to="/profile/marshrut" replace />} />
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
              path="/library"
              element={
                <OnboardingGate>
                  <Library />
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
              path="/profile/marshrut"
              element={
                <OnboardingGate>
                  <RoutesScreen />
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
        </ReducedMotionAnimatePresence>
      </Container>

      {!hideAppChrome && <BottomNavigation />}

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
  const prefersReducedMotion = useReducedMotion();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const activeItemBg = useColorModeValue('purple.50', 'purple.900');
  const activeItemHoverBg = useColorModeValue('purple.100', 'purple.800');
  const inactiveItemHoverBg = useColorModeValue('gray.100', 'gray.700');

  const pathname = location.pathname;
  const lessonSourceTab =
    pathname.startsWith('/lesson/') ? location.state?.[BOTTOM_TAB_STATE_KEY] : undefined;

  const navigationItems = [
    {
      path: '/',
      icon: <Home size={24} />,
      label: 'Сегодня',
      match: () =>
        pathname === '/' ||
        (pathname.startsWith('/lesson/') &&
          (lessonSourceTab == null || lessonSourceTab === '/')),
    },
    {
      path: '/skills',
      icon: <Brain size={24} />,
      label: 'Навыки',
      match: () =>
        pathname.startsWith('/skills') ||
        (pathname.startsWith('/lesson/') && lessonSourceTab === '/skills'),
    },
    {
      path: '/library',
      icon: <BookOpen size={24} />,
      label: 'Библиотека',
      match: () =>
        pathname.startsWith('/library') ||
        pathname.startsWith('/course/') ||
        (pathname.startsWith('/lesson/') && lessonSourceTab === '/library'),
    },
    {
      path: '/profile',
      icon: <User size={24} />,
      label: 'Я',
      match: () =>
        pathname.startsWith('/profile') ||
        (pathname.startsWith('/lesson/') && lessonSourceTab === '/profile'),
    },
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
      <Flex justify="space-around" align="center" py={1} px={1} minH="56px">
        {navigationItems.map(({ path, icon, label, match }) => {
          const isActive = match ? match() : location.pathname === path;
          const color = isActive ? 'purple.500' : inactiveColor;
          const motionProps = prefersReducedMotion
            ? {}
            : { whileHover: { scale: 1.06 }, whileTap: { scale: 0.97 } };

          return (
            <MotionBox key={label} {...motionProps}>
              <VStack
                spacing={1}
                as="button"
                type="button"
                cursor="pointer"
                onClick={() => navigate(path)}
                py={2}
                px={3}
                minH="44px"
                minW="44px"
                justify="center"
                borderRadius="lg"
                bg={isActive ? activeItemBg : 'transparent'}
                _hover={{ bg: isActive ? activeItemHoverBg : inactiveItemHoverBg }}
                transition="background 0.2s ease"
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Box color={color} lineHeight={0}>
                  {icon}
                </Box>
                <Text
                  fontSize="xs"
                  color={color}
                  fontWeight={isActive ? 'semibold' : 'normal'}
                  lineHeight="shorter"
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

export default App;
