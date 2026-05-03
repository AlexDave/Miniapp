import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Skeleton,
  useColorModeValue,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTodayLesson } from '../../hooks/useLessons';
import { useLesson } from '../../hooks/useLessons';
import PressableButton from '../motion/PressableButton';
import { useProfile } from '../../hooks/useProfile';
import { useDismissCoachTip } from '../../hooks/useCoachTips';

const MotionBox = motion(Box);

function cleanTitle(title) {
  if (!title) return '';
  return title.replace(/^День\s+\d+:\s*/i, '').trim();
}

export default function TrainScreen() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const dismissTip = useDismissCoachTip();
  const { data: today, isLoading: loadingToday, isError: todayError, error: todayErr } = useTodayLesson();
  const lessonId = today?.lesson?.id;
  const { data: detail, isLoading: loadingDetail } = useLesson(lessonId);

  const muted = useColorModeValue('gray.600', 'gray.400');

  const lesson = detail?.lesson ?? today?.lesson;
  const meta = lesson?.meta && typeof lesson.meta === 'object' ? lesson.meta : {};

  const moduleDone = today?.module?.done ?? 0;
  const moduleTotal = today?.module?.total ?? 1;
  const progressPct = moduleTotal > 0 ? (moduleDone / moduleTotal) * 100 : 0;

  if (todayError) {
    const msg =
      todayErr?.response?.status === 401
        ? 'Нужна авторизация (открой приложение из Telegram или настройте бэкенд).'
        : 'Не удалось загрузить урок. Проверь, что API запущен (например порт 5000) и прокси Vite настроен.';
    return (
      <Box pb={24} px={4}>
        <VStack spacing={4} py={8}>
          <Text fontWeight="semibold" color="orange.600">
            Ошибка загрузки
          </Text>
          <Text fontSize="sm" color={muted} textAlign="center">
            {msg}
          </Text>
        </VStack>
      </Box>
    );
  }

  if (loadingToday) {
    return (
      <Box pb={24} px={4}>
        <Skeleton height="180px" borderRadius="xl" />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box pb={24} px={4}>
        <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <VStack spacing={6} py={10} align="center" textAlign="center">
            <Text fontSize="4xl">✅</Text>
            <Text fontWeight="semibold" fontSize="lg">
              Сегодня всё сделано
            </Text>
            <Text fontSize="sm" color={muted} maxW="280px">
              Загляни завтра — серия и навыки ждут.
            </Text>
            <Text as={RouterLink} to="/courses" fontSize="sm" color="purple.500">
              Другие курсы →
            </Text>
          </VStack>
        </MotionBox>
      </Box>
    );
  }

  const duration = lesson.daily_task?.duration_min ?? meta.duration ?? 5;
  const titleShort = cleanTitle(lesson.title);

  const showTrainCoach =
    profile?.onboardingCompleted === true && profile?.coachTips?.train !== true;

  return (
    <Box pb={28} px={4} pt={2}>
      <VStack spacing={8} align="stretch" minH="60vh" justify="center">
        {showTrainCoach && (
          <Alert status="info" borderRadius="xl" fontSize="sm">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="medium">Один урок — один фокус</Text>
              <Text mt={1}>
                Нажми «Начать тренировку»: сначала шаги задания, затем короткий отчёт — так сохраняется
                серия.
              </Text>
              <Button
                size="sm"
                mt={2}
                colorScheme="purple"
                variant="outline"
                onClick={() => dismissTip.mutate('train')}
                isLoading={dismissTip.isLoading}
              >
                Понятно
              </Button>
            </Box>
          </Alert>
        )}

        <Box>
          <Text fontSize="xs" color={muted} fontWeight="medium" letterSpacing="wide">
            Тренировка
          </Text>
          <Progress value={progressPct} colorScheme="purple" size="xs" borderRadius="full" mt={3} />
          <Text fontSize="xs" color={muted} mt={1}>
            День {moduleDone + 1} из {moduleTotal}
          </Text>
        </Box>

        <MotionBox
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          textAlign="center"
        >
          <Text fontSize="sm" color={muted} mb={2}>
            Команда / тема
          </Text>
          <Text fontSize="2xl" fontWeight="extrabold" lineHeight="1.2" px={2}>
            «{titleShort}»
          </Text>
          <HStack justify="center" spacing={2} mt={4} color={muted} fontSize="sm">
            <Clock size={16} />
            <Text>~{duration} мин</Text>
          </HStack>
        </MotionBox>

        <PressableButton
          colorScheme="purple"
          size="lg"
          fullWidth
          h="16"
          fontSize="xl"
          borderRadius="2xl"
          leftIcon={<Play size={22} fill="currentColor" />}
          isLoading={loadingDetail}
          isDisabled={loadingDetail}
          successTap
          onClick={() => navigate(`/lesson/${lesson.id}`)}
        >
          Начать тренировку
        </PressableButton>
      </VStack>
    </Box>
  );
}
