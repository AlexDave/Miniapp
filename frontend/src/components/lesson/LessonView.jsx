import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import ReducedMotionAnimatePresence from '../../motion/ReducedMotionAnimatePresence';
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
import {
  useLesson,
  useSubmitReport,
  useMarkTheorySeen,
  useStartTask,
  useRepeatLesson,
  useRetryAfterFail,
} from '../../hooks/useLessons';
import { useProfile } from '../../hooks/useProfile';
import TaskChecklist from './TaskChecklist';
import TaskStepFlow from './TaskStepFlow';
import ReportForm from './ReportForm';
import LessonFailureOutcome from './LessonFailureOutcome';
import TheoryStep from './TheoryStep';
import BoneCelebrate from '../gamification/BoneCelebrate';
import LessonVictoryVideoUpload from './LessonVictoryVideoUpload';
import { MOTION, sec } from '../../motion/tokens';
import { mergeDailyTaskStepsData } from '../../utils/lessonSteps';

// Фазы урока: 0=Зачем 1=Как 2=Делаем 3=Итог
const PHASE_LABELS = ['Зачем', 'Как', 'Делаем', 'Итог'];

function WhyScreen({ why, skipCost, onNext }) {
  return (
    <VStack spacing={6} align="stretch" pt={4} pb={8}>
      <Box p={5} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
        <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={2} textTransform="uppercase" letterSpacing="wide">
          Зачем это тренировать
        </Text>
        <Text fontSize="md" lineHeight="1.7" color="gray.700">
          {why || 'Это упражнение формирует у собаке полезный навык.'}
        </Text>
      </Box>
      {skipCost && (
        <Box p={4} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200">
          <Text fontSize="xs" fontWeight="bold" color="orange.600" mb={1} textTransform="uppercase" letterSpacing="wide">
            ⚠️ Если пропустить
          </Text>
          <Text fontSize="sm" lineHeight="1.6" color="gray.700">
            {skipCost}
          </Text>
        </Box>
      )}
      <Button colorScheme="purple" size="lg" borderRadius="xl" onClick={onNext}>
        Понятно, к шагам
      </Button>
    </VStack>
  );
}

/** Нормализует fallback_tasks в массив строк для ReportForm (поддерживает оба формата). */
function normalizeFallbackTasksForUI(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((t) => typeof t === 'string');
  if (typeof raw === 'object') {
    return ['easy', 'normal', 'hard']
      .map((k) => raw[k]?.description)
      .filter(Boolean);
  }
  return [];
}

function HowScreen({ steps, onNext, onBack }) {
  const [idx, setIdx] = useState(0);
  const reduceMotion = useReducedMotion();
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
        <Text fontSize="xs" color="mutedFg">{idx + 1} из {total}</Text>
        <Progress value={((idx + 1) / total) * 100} colorScheme="purple" size="xs" borderRadius="full" flex={1} mx={2} />
        <Text fontSize="xs" color="mutedFg">{Math.round(((idx + 1) / total) * 100)}%</Text>
      </HStack>

      <ReducedMotionAnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : -20 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <Box minH="200px">
            {step ? <TheoryStep step={step} /> : <Text color="gray.400">Шаг не найден</Text>}
          </Box>
        </motion.div>
      </ReducedMotionAnimatePresence>

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

function TaskScreen({ daily, onComplete, onGiveUp, onReadAgain, quietMode }) {
  const checkboxSteps = (daily?.steps ?? []).filter((s) => s.type === 'checkbox');
  const useMicroFlow = daily && checkboxSteps.length > 0;

  return (
    <VStack spacing={4} align="stretch" pt={2} pb={8}>
      <Button
        size="xs"
        variant="ghost"
        color="mutedFg"
        alignSelf="flex-start"
        leftIcon={<ChevronLeft size={12} />}
        onClick={onReadAgain}
      >
        Перечитать шаги
      </Button>

      {useMicroFlow && (
        <TaskStepFlow
          task={daily}
          onComplete={onComplete}
          onGiveUp={onGiveUp}
          quietMode={quietMode}
        />
      )}
      {!useMicroFlow && daily && (
        <TaskChecklist task={daily} onComplete={(rows) => onComplete(rows)} />
      )}
      {!daily && (
        <VStack spacing={4}>
          <Text color="mutedFg" fontSize="sm">Нет практического задания — отметь итог.</Text>
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
      <Text fontSize="sm" color="mutedFg">Косточки добавлены в копилку.</Text>
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
      <Button as={RouterLink} to="/" variant="ghost" size="sm">
        На главную
      </Button>
    </VStack>
  );
}

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { data, isLoading, error } = useLesson(lessonId);
  const submitReport = useSubmitReport();
  const markTheorySeen = useMarkTheorySeen();
  const startTask = useStartTask();
  const repeatLesson = useRepeatLesson();
  const retryAfterFail = useRetryAfterFail();
  const { data: profile } = useProfile();

  const [phase, setPhase] = useState(null);
  const [taskStepsData, setTaskStepsData] = useState([]);
  const [taskAborted, setTaskAborted] = useState(false);
  const [bonesResult, setBonesResult] = useState(null);
  const [cooldownHours, setCooldownHours] = useState(null);
  const wakeLockRef = useRef(null);

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

  useEffect(() => {
    if (phase !== 2) return undefined;

    const tw = window.Telegram?.WebApp;
    try {
      tw?.disableVerticalSwipes?.();
    } catch {
      /* ignore */
    }

    let cancelled = false;
    async function lockScreen() {
      if (!('wakeLock' in navigator) || wakeLockRef.current) return;
      try {
        const wl = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await wl.release();
          return;
        }
        wakeLockRef.current = wl;
        wl.addEventListener?.('release', () => {
          wakeLockRef.current = null;
        });
      } catch {
        /* ignore */
      }
    }
    lockScreen();

    const onVis = () => {
      if (document.visibilityState === 'visible') lockScreen();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      try {
        tw?.enableVerticalSwipes?.();
      } catch {
        /* ignore */
      }
      wakeLockRef.current?.release?.().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [phase, lessonId]);

  if (isLoading) {
    return <Center h="50vh"><Spinner size="lg" color="purple.500" /></Center>;
  }

  if (error || !data?.lesson) {
    const detail =
      error?.response?.data?.error ||
      (error?.message && error.message !== 'Network Error' ? error.message : null);
    return (
      <Alert status="error" borderRadius="lg" m={4}>
        <AlertIcon />
        <Box>
          <Text fontWeight="medium">Не удалось открыть урок</Text>
          {detail ? (
            <Text fontSize="sm" mt={1} color="gray.600">
              {detail}
            </Text>
          ) : (
            <Text fontSize="sm" mt={1} color="gray.600">
              Проверьте, что API запущен (порт 5000) и вы вошли в приложение.
            </Text>
          )}
        </Box>
      </Alert>
    );
  }

  if (phase === null) {
    return <Center h="50vh"><Spinner size="lg" color="purple.500" /></Center>;
  }

  const { lesson } = data;
  let lessonMeta = {};
  if (lesson.meta) {
    if (typeof lesson.meta === 'object') lessonMeta = lesson.meta;
    else try {
      lessonMeta = JSON.parse(lesson.meta);
    } catch {
      lessonMeta = {};
    }
  }
  const daily = lesson.daily_task;
  const titleShort = lesson.title?.replace(/^День\s+\d+:\s*/i, '').trim() ?? lesson.title;
  const theorySteps = lesson.steps ?? [];

  // Завершённый урок
  if (phase === -1 && !bonesResult) {
    return (
      <Box pb={24}>
        <HStack px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
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
    if (!isSuccess) {
      const fallbackTree = bonesResult.fallback_tree ?? lesson?.fallback_tree ?? null;
      return (
        <LessonFailureOutcome
          bonesResult={bonesResult}
          fallbackTree={fallbackTree}
          lessonId={lessonId}
          isRetrying={retryAfterFail.isLoading}
          onHome={() => navigate('/')}
          onRetryAfterFail={async () => {
            try {
              await retryAfterFail.mutateAsync(parseInt(lessonId, 10));
              setBonesResult(null);
              setTaskAborted(false);
              setPhase(0);
            } catch {
              /* toast optional */
            }
          }}
        />
      );
    }

    const er = bonesResult.emotional_reward;

    return (
      <Box pb={24} px={4}>
        <VStack
          spacing={6}
          py={10}
          align="center"
          textAlign="center"
          as="section"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <BoneCelebrate>
            <Text fontSize="5xl" display="block">🦴</Text>
          </BoneCelebrate>
          <Text fontWeight="bold" fontSize="xl">
            {bonesResult.bones_earned > 0 ? `+${bonesResult.bones_earned} косточка` : 'Выполнено!'}
            {er?.skill_bones_target != null ? (
              <Text as="span" display="block" fontSize="md" fontWeight="medium" color="gray.600" mt={1}>
                {er.skill_bones_current}/{er.skill_bones_target} по «{er.skill_title}»
              </Text>
            ) : null}
          </Text>
          {er?.atomic_outcome ? (
            <Text fontSize="md" color="gray.700" lineHeight="tall" px={1} maxW="md">
              <Text as="span" fontWeight="semibold" color="purple.600">
                {er.pet_name}
                :{' '}
              </Text>
              {er.atomic_outcome}
            </Text>
          ) : null}
          {bonesResult.is_special_bone && (
            <Badge colorScheme="orange" px={3} py={1} borderRadius="full" fontSize="sm">
              Особая косточка — 7 дней подряд!
            </Badge>
          )}
          <Text fontSize="sm" color="mutedFg">{bonesResult.feedback_message}</Text>
          <Text fontSize="sm" color="purple.600" fontWeight="medium">
            Стадия: {bonesResult.bones_stage}
          </Text>
          <LessonVictoryVideoUpload lessonId={parseInt(lessonId, 10)} />
          <Button colorScheme="purple" size="lg" borderRadius="xl" onClick={() => navigate('/')}>
            На главную
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
    setTaskAborted(false);
    setPhase(2);
  }

  async function handleTaskComplete(rows) {
    setTaskAborted(false);
    setTaskStepsData(rows);
    setPhase(3);
  }

  function handleTaskGiveUp(rows) {
    setTaskAborted(true);
    setTaskStepsData(rows);
    setPhase(3);
  }

  async function handleReportSubmit({ success, note }) {
    const merged = daily ? mergeDailyTaskStepsData(daily, taskStepsData, success) : [];
    let fromFallbackTier = 1;
    try {
      const raw = sessionStorage.getItem(`lesson_fail_tier_${lessonId}`);
      if (raw != null && raw !== '') {
        const n = parseInt(raw, 10);
        if (Number.isFinite(n) && n >= 1 && n <= 3) fromFallbackTier = n;
      }
    } catch {
      fromFallbackTier = 1;
    }
    try {
      const result = await submitReport.mutateAsync({
        lessonId: parseInt(lessonId, 10),
        steps_data: merged,
        success,
        note,
        from_fallback_tier: fromFallbackTier,
      });
      try {
        sessionStorage.removeItem(`lesson_fail_tier_${lessonId}`);
      } catch {
        /* ignore */
      }
      setBonesResult(result);
    } catch {
      /* toast */
    }
  }

  return (
    <Box pb={24}>
      <HStack px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
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
        <ReducedMotionAnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: reduceMotion ? 0 : 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
            transition={{
              duration: reduceMotion ? 0 : sec(MOTION.duration.normal),
              ease: MOTION.easing.default,
            }}
            style={{ width: '100%' }}
          >
            {phase === 0 && (
              <WhyScreen why={lessonMeta.why} skipCost={lessonMeta.skip_cost} onNext={handleTheoryDone} />
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
                <Text color="mutedFg" fontSize="sm">Подробные шаги будут добавлены скоро.</Text>
                <Button colorScheme="purple" onClick={handleHowDone}>К заданию</Button>
              </VStack>
            )}

            {phase === 2 && (
              <TaskScreen
                daily={daily}
                onComplete={handleTaskComplete}
                onGiveUp={handleTaskGiveUp}
                onReadAgain={() => setPhase(theorySteps.length > 0 ? 1 : 0)}
                quietMode={profile?.lessonQuietMode === true}
              />
            )}

            {phase === 3 && (
              <Box pt={2} pb={8}>
                <ReportForm
                  key={taskAborted ? 'task-abort' : 'task-normal'}
                  initialSuccess={taskAborted ? 'no' : 'yes'}
                  fallbackTasks={normalizeFallbackTasksForUI(lessonMeta.fallback_tasks)}
                  onSubmit={handleReportSubmit}
                  isLoading={submitReport.isLoading}
                />
              </Box>
            )}
          </motion.div>
        </ReducedMotionAnimatePresence>
      </Box>
    </Box>
  );
}
