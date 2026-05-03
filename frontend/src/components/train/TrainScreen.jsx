import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Badge,
  Skeleton,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTodayLesson } from '../../hooks/useLessons';
import { useLesson } from '../../hooks/useLessons';

const MotionBox = motion(Box);

function cleanTitle(title) {
  if (!title) return '';
  return title.replace(/^День\s+\d+:\s*/i, '').trim();
}

export default function TrainScreen() {
  const navigate = useNavigate();
  const { data: today, isLoading: loadingToday } = useTodayLesson();
  const lessonId = today?.lesson?.id;
  const { data: detail, isLoading: loadingDetail } = useLesson(lessonId);

  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.400');

  const lesson = detail?.lesson ?? today?.lesson;
  const meta = lesson?.meta && typeof lesson.meta === 'object' ? lesson.meta : {};
  const goalLine = lesson?.description;
  const why = meta.why;
  const tasks =
    lesson?.daily_task?.steps?.filter((s) => s.type === 'checkbox').map((s) => s.label) ??
    [];

  const moduleDone = today?.module?.done ?? 0;
  const moduleTotal = today?.module?.total ?? 1;
  const progressPct = moduleTotal > 0 ? (moduleDone / moduleTotal) * 100 : 0;

  if (loadingToday) {
    return (
      <Box pb={24} px={2}>
        <Skeleton height="220px" borderRadius="xl" />
      </Box>
    );
  }

  if (!lesson) {
    return (
      <Box pb={24} px={2}>
        <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <VStack spacing={6} py={8} align="center" textAlign="center">
            <Text fontSize="4xl">✅</Text>
            <Text fontWeight="semibold" fontSize="lg">
              Сегодня всё сделано
            </Text>
            <Text fontSize="sm" color={muted} maxW="280px">
              Возвращайся завтра за новым шагом — серия и навыки ждут.
            </Text>
            <Button as={RouterLink} to="/courses" variant="outline" colorScheme="purple">
              Другие курсы
            </Button>
          </VStack>
        </MotionBox>
      </Box>
    );
  }

  const duration = lesson.daily_task?.duration_min ?? meta.duration ?? 5;
  const titleShort = cleanTitle(lesson.title);

  return (
    <Box pb={24} px={2}>
      <VStack spacing={5} align="stretch">
        <Box>
          <Text fontSize="sm" color={muted}>
            Тренировка
          </Text>
          <Progress value={progressPct} colorScheme="purple" size="sm" borderRadius="full" mt={2} />
          <Text fontSize="xs" color={muted} mt={1}>
            Шаг {moduleDone + 1} из {moduleTotal}
          </Text>
        </Box>

        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          p={5}
          bg={bg}
          border="1px solid"
          borderColor={border}
          borderRadius="2xl"
          shadow="sm"
        >
          <Badge colorScheme="purple" mb={2} borderRadius="md">
            Задание
          </Badge>
          <Text fontSize="xl" fontWeight="bold" lineHeight="short">
            {titleShort}
          </Text>
          {goalLine && (
            <Text fontSize="sm" color={muted} mt={2}>
              Цель: {goalLine}
            </Text>
          )}
        </MotionBox>

        {why && (
          <Box p={4} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.100">
            <Text fontSize="xs" fontWeight="semibold" color="blue.700" mb={1}>
              Зачем это
            </Text>
            <Text fontSize="sm" color="blue.900">
              {why}
            </Text>
          </Box>
        )}

        {tasks.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
              Шаги
            </Text>
            <VStack spacing={2} align="stretch">
              {tasks.map((t, i) => (
                <HStack key={i} align="flex-start" spacing={2}>
                  <Box mt={0.5}>
                    <CheckCircle2 size={16} color="#38A169" />
                  </Box>
                  <Text fontSize="sm">{t}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        <HStack spacing={2} color={muted} fontSize="sm">
          <Clock size={16} />
          <Text>~{duration} мин</Text>
        </HStack>

        <Button
          colorScheme="purple"
          size="lg"
          borderRadius="xl"
          h="14"
          fontSize="md"
          leftIcon={<Play size={20} />}
          isLoading={loadingDetail}
          onClick={() => navigate(`/lesson/${lesson.id}`)}
        >
          Начать
        </Button>

        <Center>
          <Button as={RouterLink} to="/skills" variant="link" size="sm" color={muted}>
            Карта навыков
          </Button>
        </Center>
      </VStack>
    </Box>
  );
}
