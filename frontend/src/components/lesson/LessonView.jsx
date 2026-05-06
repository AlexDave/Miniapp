import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
} from '@chakra-ui/react';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
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
import LessonMaterialScreen from './LessonMaterialScreen';
import { LessonJustCompletedScreen, LessonAlreadyCompletedScreen } from './LessonSuccessScreen';
import { MOTION, sec } from '../../motion/tokens';
import { mergeDailyTaskStepsData } from '../../utils/lessonSteps';
import { BOTTOM_TAB_STATE_KEY } from '../../constants/bottomNav';
import { getTheorySectionsFromLesson, getPitfalls } from '../../utils/theorySections';

/** Фазы: Зачем → Материал → Делаем → Итог */
const PHASE = {
  WHY: 0,
  MATERIAL: 1,
  TASK: 2,
  REPORT: 3,
};

const PHASE_LABELS = ['Зачем', 'Материал', 'Делаем', 'Итог'];

function hasPitfallsLocal(meta) {
  const { mistakes, tip } = getPitfalls(meta);
  const hasTip = tip != null && String(tip).trim().length > 0;
  return mistakes.length > 0 || hasTip;
}

/** Есть ли что показать на объединённом экране материала */
function hasMaterialContent(meta, lesson) {
  return (
    getTheorySectionsFromLesson(meta).length > 0 ||
    (lesson?.steps?.length ?? 0) > 0 ||
    hasPitfallsLocal(meta)
  );
}

function nextPhaseAfterWhy(meta, lesson) {
  if (hasMaterialContent(meta, lesson)) return PHASE.MATERIAL;
  return PHASE.TASK;
}

function firstReadingPhase(meta, lesson) {
  if (hasMaterialContent(meta, lesson)) return PHASE.MATERIAL;
  return PHASE.WHY;
}

/** Разбор meta с API: объект, JSON-строка или «строка внутри строки». */
function parseLessonMetaRaw(meta) {
  if (meta == null) return {};
  if (typeof meta === 'object' && !Array.isArray(meta)) return meta;
  if (typeof meta === 'string') {
    try {
      let o = JSON.parse(meta);
      if (typeof o === 'string') {
        try {
          o = JSON.parse(o);
        } catch {
          /* одна строка JSON */
        }
      }
      return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
    } catch {
      return {};
    }
  }
  return {};
}

/** Достаёт абзац после ## Зачем из markdown теории (как в seed). */
function whyFromTheoryMarkdown(theory) {
  if (!theory || typeof theory !== 'string') return '';
  const m = theory.match(/## Зачем\s*\n+([\s\S]*?)(?=\n## |\n### |\n>|\n\n\n|$)/);
  if (!m?.[1]) return '';
  return m[1].replace(/\n{2,}/g, '\n').trim();
}

/** Текст для экрана «Смысл дня»: несколько источников, чтобы не было пусто при кэше/старых ответах. */
function resolveLessonWhyText(lesson, lessonMeta) {
  const fromTitle = lesson?.title?.replace(/^День\s+\d+:\s*/i, '').trim();
  const candidates = [
    lessonMeta?.why,
    lessonMeta?.Why,
    lesson?.description,
    whyFromTheoryMarkdown(lesson?.theory),
    fromTitle,
  ];
  for (const c of candidates) {
    if (c != null && String(c).trim()) return String(c).trim();
  }
  return '';
}

function WhyScreen({ why, skipCost, onNext }) {
  const body =
    (why && String(why).trim()) ||
    'Краткое объяснение смысла дня пока не загружено. Попробуйте обновить страницу.';
  return (
    <VStack spacing={6} align="stretch" pt={4} pb={8}>
      <Box p={5} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.100">
        <Text fontSize="sm" fontWeight="bold" color="purple.600" mb={2} textTransform="uppercase" letterSpacing="wide">
          Смысл дня
        </Text>
        <Text fontSize="md" lineHeight="1.7" color="gray.700">
          {body}
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
        Понятно, дальше
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
        Перечитать материал
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

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

  const progress = data?.progress;
  const report = data?.report;

  // Инициализируем фазу из серверного state
  useEffect(() => {
    if (!data || phase !== null) return;
    if (report) {
      setPhase(-1); // completed
    } else if (progress?.state === 'theory_done') {
      setPhase(PHASE.TASK); // перейти сразу к заданию
    } else {
      setPhase(PHASE.WHY); // начать с «Зачем»
    }
  }, [data, phase, report, progress]);

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
  const lessonMeta = parseLessonMetaRaw(lesson.meta);
  const lessonWhyText = resolveLessonWhyText(lesson, lessonMeta);
  const skipCostText = lessonMeta.skip_cost ?? lessonMeta.skipCost;
  const daily = lesson.daily_task;
  const titleShort = lesson.title?.replace(/^День\s+\d+:\s*/i, '').trim() ?? lesson.title;
  const theorySections = getTheorySectionsFromLesson(lessonMeta);
  const pitfallsData = getPitfalls(lessonMeta);
  const practiceSteps = lesson.steps ?? [];
  const nextLessonRaw = data?.next_lesson ?? null;
  const fromSkillsTab = location.state?.[BOTTOM_TAB_STATE_KEY] === '/skills';
  const nextCourseLesson = fromSkillsTab ? null : nextLessonRaw;

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
        <LessonAlreadyCompletedScreen
          nextLesson={nextCourseLesson}
          onRepeat={async () => {
            try {
              await repeatLesson.mutateAsync(parseInt(lessonId, 10));
              setPhase(PHASE.WHY);
            } catch {
              /* ошибка — toast в мутации при необходимости */
            }
          }}
          isRepeating={repeatLesson.isLoading}
        />
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
              setPhase(PHASE.WHY);
            } catch {
              /* toast optional */
            }
          }}
        />
      );
    }

    return (
      <LessonJustCompletedScreen
        bonesResult={bonesResult}
        nextLesson={nextCourseLesson}
        lessonTitleShort={titleShort}
        onHome={() => navigate('/')}
        onRepeat={() => {
          setBonesResult(null);
          setPhase(PHASE.WHY);
        }}
      />
    );
  }

  async function enterTaskPhase() {
    try {
      await startTask.mutateAsync(parseInt(lessonId, 10));
    } catch { /* non-blocking */ }
    setTaskAborted(false);
    setPhase(PHASE.TASK);
  }

  async function handleWhyContinue() {
    try {
      await markTheorySeen.mutateAsync(parseInt(lessonId, 10));
    } catch { /* non-blocking */ }
    const next = nextPhaseAfterWhy(lessonMeta, lesson);
    if (next === PHASE.TASK) {
      await enterTaskPhase();
    } else {
      setPhase(next);
    }
  }

  async function handleMaterialContinue() {
    await enterTaskPhase();
  }

  async function handleTaskComplete(rows) {
    setTaskAborted(false);
    setTaskStepsData(rows);
    setPhase(PHASE.REPORT);
  }

  function handleTaskGiveUp(rows) {
    setTaskAborted(true);
    setTaskStepsData(rows);
    setPhase(PHASE.REPORT);
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
            {phase === PHASE.WHY && (
              <WhyScreen
                why={lessonWhyText}
                skipCost={skipCostText}
                onNext={handleWhyContinue}
              />
            )}

            {phase === PHASE.MATERIAL && (
              <LessonMaterialScreen
                theorySections={theorySections}
                practiceSteps={practiceSteps}
                mistakes={pitfallsData.mistakes}
                tip={pitfallsData.tip}
                onNext={handleMaterialContinue}
                onBack={() => setPhase(PHASE.WHY)}
              />
            )}

            {phase === PHASE.TASK && (
              <TaskScreen
                daily={daily}
                onComplete={handleTaskComplete}
                onGiveUp={handleTaskGiveUp}
                onReadAgain={() => setPhase(firstReadingPhase(lessonMeta, lesson))}
                quietMode={profile?.lessonQuietMode === true}
              />
            )}

            {phase === PHASE.REPORT && (
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
