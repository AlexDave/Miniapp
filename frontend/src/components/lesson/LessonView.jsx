import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  IconButton,
  Progress,
} from '@chakra-ui/react';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useLesson, useSubmitReport, useMarkTheorySeen, useStartTask, useRepeatLesson } from '../../hooks/useLessons';
import TaskChecklist from './TaskChecklist';
import TaskStepFlow from './TaskStepFlow';
import ReportForm from './ReportForm';
import TheoryStep from './TheoryStep';
import { MOTION, sec } from '../../motion/tokens';
import { mergeDailyTaskStepsData } from '../../utils/lessonSteps';

// Фазы урока: 0=Зачем 1=Как 2=Делаем 3=Итог
const PHASE_LABELS = ['Зачем', 'Как', 'Делаем', 'Итог'];

function WhyScreen({ why, onNext }) {
  return (
    <VStack spacing={6} align="stretch" pt={4} pb={8}>
      <Box p={5} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
        <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={2} textTransform="uppercase" letterSpacing="wide">
          Зачем это тренировать
        </Text>
        <Text fontSize="md" lineHeight="1.7" color="gray.700" _dark={{ color: 'gray.200' }}>
          {why || 'Это упражнение формирует у собаки полезный навык.'}
        </Text>
      </Box>
      <Button colorScheme="purple" size="lg" borderRadius="xl" onClick={onNext}>
        Понятно, к шагам
      </Button>
    </VStack>
  );
}

function HowScreen({ steps, onNext, onBack }) {
  const [idx, setIdx] = useState(0);
  const total = steps.length;

  function next() {
    if (idx < total - 1) setIdx((i) => i + 1);
    else onNext();
  }
  function prev() {
    if (idx > 0) setIdx((i) => i - 1);
    else onBack?.();
  }

  const step = steps[idx];

  return (
    <VStack spacing={4} align="stretch" pt={4} pb={8}>
      <HStack justify="space-between">
        <Text fontSize="xs" color="gray.500">{idx + 1} из {total}</Text>
        <Progress value={((idx + 1) / total) * 100} colorScheme="purple" size="xs" borderRadius="full" flex={1} mx={2} />
        <Text fontSize="xs" color="gray.500">{Math.round(((idx + 1) / total) * 100)}%</Text>
      </HStack>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Box minH="200px">
            {step ? <TheoryStep step={step} /> : <Text color="gray.400">Шаг не найден</Text>}
          </Box>
        </motion.div>
      </AnimatePresence>

      <HStack spacing={3}>
        {idx > 0 && (
          <Button variant="ghost" leftIcon={<ChevronLeft size={16} />} onClick={prev} flex={1}>
            Назад
          </Button>
        )}
        <Button
          colorScheme="purple"
          rightIcon={idx < total - 1 ? <ChevronRight size={16} /> : undefined}
          onClick={next}
          flex={2}
        >
          {idx < total - 1 ? 'Следующий шаг' : 'К заданию'}
        </Button>
      </HStack>
    </VStack>
  );
}

function TaskScreen({ daily, onComplete, onReadAgain }) {
  const checkboxSteps = (daily?.steps ?? []).filter((s) => s.type === 'checkbox');
  const useMicroFlow = daily && checkboxSteps.length > 0;

  return (
    <VStack spacing={4} align="stretch" pt={2} pb={8}>
      <Button
        size="xs"
        variant="ghost"
        color="gray.500"
        alignSelf="flex-start"
        leftIcon={<ChevronLeft size={12} />}
        onClick={onReadAgain}
      >
        Перечитать шаги
      </Button>

      {useMicroFlow && (
        <TaskStepFlow task={daily} onComplete={onComplete} />
      )}
      {!useMicroFlow && daily && (
        <TaskChecklist task={daily} onComplete={(rows) => onComplete(rows)} />
      )}
      {!daily && (
        <VStack spacing={4}>
          <Text color="gray.500" fontSize="sm">Нет практического задания — отметь итог.</Text>
          <Button colorScheme="purple" onClick={() => onComplete([])}>К итогу</Button>
        </VStack>
      )}
    </VStack>
  );
}

function CompletedScreen({ report, lessonId, onRepeat, isRepeating, cooldownHours }) {
  const navigate = useNavigate();
  return (
    <VStack spacing={6} py={10} align="center" textAlign="center">
      <Text fontSize="4xl">🦴</Text>
      <Text fontWeight="semibold" fontSize="lg">Урок уже выполнен</Text>
      <Text fontSize="sm" color="gray.500">Косточки добавлены в копилку.</Text>
      {cooldownHours ? (
        <Box px={4} py={3} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.100">
          <Text fontSize="sm" color="orange.700">
            Повтор доступен через {cooldownHours} ч. — дай собаке закрепить навык!
          </Text>
        </Box>
      ) : (
        <Button colorScheme="purple" variant="outline" leftIcon={<RotateCcw size={16} />} onClick={onRepeat} isLoading={isRepeating}>
          Перепройти
        </Button>
      )}
      <Button as={RouterLink} to="/train" variant="ghost" size="sm">
        К тренировке
      </Button>
    </VStack>
  );
}

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useLesson(lessonId);
  const submitReport = useSubmitReport();
  const markTheorySeen = useMarkTheorySeen();
  const startTask = useStartTask();
  const repeatLesson = useRepeatLesson();

  const [phase, setPhase] = useState(null);
  const [taskStepsData, setTaskStepsData] = useState([]);
  const [bonesResult, setBonesResult] = useState(null);
  const [cooldownHours, setCooldownHours] = useState(null);

  const progress = data?.progress;
  const report = data?.report;

  // Инициализируем фазу из серверного state
  useEffect(() => {
    if (!data || phase !== null) return;
    if (report) {
      setPhase(-1); // completed
    } else if (progress?.state === 'theory_done') {
      setPhase(2); // перейти сразу к заданию
    } else {
      setPhase(0); // начать с «Зачем»
    }
  }, [data, phase, report, progress]);

  if (isLoading || phase === null) {
    return <Center h="50vh"><Spinner size="lg" color="purple.500" /></Center>;
  }

  if (error || !data?.lesson) {
    return (
      <Alert status="error" borderRadius="lg" m={4}>
        <AlertIcon />Урок не найден
      </Alert>
    );
  }

  const { lesson } = data;
  const lessonMeta = typeof lesson.meta === 'object' ? (lesson.meta ?? {}) : {};
  const daily = lesson.daily_task;
  const titleShort = lesson.title?.replace(/^День\s+\d+:\s*/i, '').trim() ?? lesson.title;
  const theorySteps = lesson.steps ?? [];

  // Завершённый урок
  if (phase === -1 && !bonesResult) {
    return (
      <Box pb={24}>
        <HStack px={4} py={3} borderBottom="1px solid" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Назад
          </Button>
          <Text fontSize="sm" fontWeight="semibold" noOfLines={1} flex={1}>{titleShort}</Text>
        </HStack>
        <Box px={4}>
          <CompletedScreen
            report={report}
            lessonId={lessonId}
            cooldownHours={cooldownHours}
            onRepeat={async () => {
              try {
                await repeatLesson.mutateAsync(parseInt(lessonId, 10));
                setCooldownHours(null);
                setPhase(0);
              } catch (err) {
                const hours = err?.response?.data?.hours_left ?? null;
                if (hours) setCooldownHours(hours);
              }
            }}
            isRepeating={repeatLesson.isLoading}
          />
        </Box>
      </Box>
    );
  }

  // Экран результата (косточки)
  if (bonesResult) {
    const isSuccess = bonesResult.outcome !== 'no';
    const fallbacks = bonesResult.fallback_tasks ?? [];
    return (
      <Box pb={24} px={4}>
        <VStack spacing={6} py={10} align="center" textAlign="center">
          {isSuccess ? (
            <>
              <Text fontSize="5xl">🦴</Text>
              <Text fontWeight="bold" fontSize="xl">
                {bonesResult.bones_earned > 0 ? `+${bonesResult.bones_earned} косточка в копилку!` : 'Выполнено!'}
              </Text>
              {bonesResult.is_special_bone && (
                <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
                  Особая косточка — 7 дней подряд!
                </Badge>
              )}
              <Text fontSize="sm" color="gray.500">{bonesResult.feedback_message}</Text>
              <Text fontSize="sm" color="purple.600" fontWeight="medium">
                Стадия: {bonesResult.bones_stage}
              </Text>
            </>
          ) : (
            <>
              <Text fontSize="5xl">💪</Text>
              <Text fontWeight="bold" fontSize="xl">Бывает</Text>
              <Text fontSize="sm" color="gray.500">{bonesResult.feedback_message}</Text>
              {fallbacks.length > 0 && (
                <Box w="100%" p={4} bg="orange.50" borderRadius="xl" textAlign="left">
                  <Text fontSize="xs" fontWeight="bold" color="orange.700" mb={2}>Попробуй упрощённый вариант:</Text>
                  {fallbacks.map((f, i) => (
                    <Text key={i} fontSize="sm" color="orange.800">• {f}</Text>
                  ))}
                </Box>
              )}
            </>
          )}
          <Button colorScheme="purple" size="lg" borderRadius="xl" onClick={() => navigate('/train')}>
            К тренировке
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setBonesResult(null); setPhase(0); }}>
            Перепройти
          </Button>
        </VStack>
      </Box>
    );
  }

  async function handleTheoryDone() {
    try {
      await markTheorySeen.mutateAsync(parseInt(lessonId, 10));
    } catch { /* non-blocking */ }
    setPhase(1);
  }

  async function handleHowDone() {
    try {
      await startTask.mutateAsync(parseInt(lessonId, 10));
    } catch { /* non-blocking */ }
    setPhase(2);
  }

  async function handleTaskComplete(rows) {
    setTaskStepsData(rows);
    setPhase(3);
  }

  async function handleReportSubmit({ success, note }) {
    const merged = daily ? mergeDailyTaskStepsData(daily, taskStepsData, success) : [];
    try {
      const result = await submitReport.mutateAsync({
        lessonId: parseInt(lessonId, 10),
        steps_data: merged,
        success,
        note,
      });
      setBonesResult(result);
    } catch {
      /* toast */
    }
  }

  return (
    <Box pb={24}>
      <HStack px={4} py={3} borderBottom="1px solid" borderColor="gray.100" _dark={{ borderColor: 'gray.700' }}>
        <IconButton
          aria-label="Назад"
          icon={<ArrowLeft size={18} />}
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
        />
        <Box flex={1}>
          <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{titleShort}</Text>
        </Box>
        <Badge colorScheme="amber" variant="subtle" fontSize="xs">
          🦴 +1 косточка
        </Badge>
      </HStack>

      <HStack px={4} py={2} spacing={1} justify="center">
        {PHASE_LABELS.map((label, i) => (
          <Badge
            key={label}
            colorScheme={phase === i ? 'purple' : phase > i ? 'green' : 'gray'}
            variant={phase === i ? 'solid' : phase > i ? 'subtle' : 'outline'}
            borderRadius="full"
            px={2}
            fontSize="xs"
          >
            {label}
          </Badge>
        ))}
      </HStack>

      <Divider />

      <Box px={4} pt={2} overflow="hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: sec(MOTION.duration.normal), ease: MOTION.easing.default }}
            style={{ width: '100%' }}
          >
            {phase === 0 && (
              <WhyScreen why={lessonMeta.why} onNext={handleTheoryDone} />
            )}

            {phase === 1 && theorySteps.length > 0 && (
              <HowScreen
                steps={theorySteps}
                onNext={handleHowDone}
                onBack={() => setPhase(0)}
              />
            )}
            {phase === 1 && theorySteps.length === 0 && (
              <VStack spacing={4} pt={4} pb={8}>
                <Text color="gray.500" fontSize="sm">Подробные шаги будут добавлены скоро.</Text>
                <Button colorScheme="purple" onClick={handleHowDone}>К заданию</Button>
              </VStack>
            )}

            {phase === 2 && (
              <TaskScreen
                daily={daily}
                onComplete={handleTaskComplete}
                onReadAgain={() => setPhase(theorySteps.length > 0 ? 1 : 0)}
              />
            )}

            {phase === 3 && (
              <Box pt={2} pb={8}>
                <ReportForm onSubmit={handleReportSubmit} isLoading={submitReport.isLoading} />
              </Box>
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
