import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { ArrowLeft, BookOpen, Info } from 'lucide-react';
import { useLesson } from '../../hooks/useLessons';
import { useSubmitReport } from '../../hooks/useLessons';
import TaskChecklist from './TaskChecklist';
import TaskStepFlow from './TaskStepFlow';
import ReportForm from './ReportForm';
import XPAnimation from '../gamification/XPAnimation';
import TheoryStep from './TheoryStep';
import { MOTION, sec } from '../../motion/tokens';
import { mergeDailyTaskStepsData } from '../../utils/lessonSteps';
import { useProfile } from '../../hooks/useProfile';
import { useDismissCoachTip } from '../../hooks/useCoachTips';

const PHASES = ['Действие', 'Итог'];

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useLesson(lessonId);
  const submitReport = useSubmitReport();
  const theoryModal = useDisclosure();
  const { data: profile } = useProfile();
  const dismissLessonTip = useDismissCoachTip();

  const [phase, setPhase] = useState(0);
  const [taskStepsData, setTaskStepsData] = useState([]);
  const [xpResult, setXpResult] = useState(null);

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="lg" color="purple.500" />
      </Center>
    );
  }

  if (error || !data?.lesson) {
    return (
      <Alert status="error" borderRadius="lg" m={4}>
        <AlertIcon />
        Урок не найден
      </Alert>
    );
  }

  const { lesson, report } = data;

  let lessonMeta = {};
  if (lesson.meta) {
    if (typeof lesson.meta === 'string') {
      try {
        lessonMeta = JSON.parse(lesson.meta);
      } catch {
        lessonMeta = {};
      }
    } else {
      lessonMeta = lesson.meta;
    }
  }

  if (report) {
    return (
      <Box p={4}>
        <Alert status="success" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold">Урок уже завершён</Text>
            <Text fontSize="sm">Вы получили {report.xp_earned} XP</Text>
          </Box>
        </Alert>
        <Button mt={4} variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Назад
        </Button>
      </Box>
    );
  }

  const daily = lesson.daily_task;
  const checkboxSteps = (daily?.steps ?? []).filter((s) => s.type === 'checkbox');
  const useMicroFlow = daily && checkboxSteps.length > 0;

  async function handleReportSubmit({ success, note }) {
    const merged = daily ? mergeDailyTaskStepsData(daily, taskStepsData, success) : [];
    try {
      const result = await submitReport.mutateAsync({
        lessonId: parseInt(lessonId, 10),
        steps_data: merged,
        success,
        note,
      });
      setXpResult(result);
    } catch {
      /* toast */
    }
  }

  function handleLegacyTaskComplete(stepsData) {
    setTaskStepsData(stepsData);
    setPhase(1);
  }

  if (xpResult) {
    return (
      <XPAnimation
        result={xpResult}
        onContinue={() => navigate('/train')}
        onRetry={() => {
          setXpResult(null);
          setPhase(0);
        }}
      />
    );
  }

  const titleShort = lesson.title?.replace(/^День\s+\d+:\s*/i, '').trim() ?? lesson.title;

  const showLessonCoach =
    profile?.onboardingCompleted === true && profile?.coachTips?.lesson !== true;

  return (
    <Box pb={24}>
      {showLessonCoach && (
        <Alert status="info" mx={4} mt={3} borderRadius="xl" fontSize="sm">
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="medium">Как проходит урок</Text>
            <Text mt={1}>
              Сначала выполняешь практику по шагам, затем коротко отмечаешь итог — за это начисляют XP.
            </Text>
            <Button
              size="sm"
              mt={2}
              colorScheme="purple"
              variant="outline"
              onClick={() => dismissLessonTip.mutate('lesson')}
              isLoading={dismissLessonTip.isLoading}
            >
              Понятно
            </Button>
          </Box>
        </Alert>
      )}

      <HStack px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Box flex={1}>
          <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
            {titleShort}
          </Text>
          <HStack spacing={2} mt={0.5}>
            <Badge colorScheme="purple" fontSize="xs">
              +{lesson.xp_reward} XP
            </Badge>
            {(lesson.theory || lesson.steps?.length > 0) && (
              <IconButton
                aria-label="Теория и подсказки"
                icon={<Info size={18} />}
                size="xs"
                variant="ghost"
                onClick={theoryModal.onOpen}
              />
            )}
          </HStack>
        </Box>
      </HStack>

      <HStack px={4} py={2} spacing={2} justify="center">
        {PHASES.map((label, i) => (
          <Badge
            key={label}
            colorScheme={phase === i ? 'purple' : 'gray'}
            variant={phase === i ? 'solid' : 'outline'}
            borderRadius="full"
            px={3}
          >
            {label}
          </Badge>
        ))}
      </HStack>

      <Divider />

      <Box px={4} pt={4} overflow="hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: sec(MOTION.duration.normal), ease: MOTION.easing.default }}
            style={{ width: '100%' }}
          >
            {phase === 0 && useMicroFlow && (
              <TaskStepFlow
                task={daily}
                onComplete={(rows) => {
                  setTaskStepsData(rows);
                  setPhase(1);
                }}
              />
            )}

            {phase === 0 && !useMicroFlow && daily && (
              <VStack spacing={4} align="stretch">
                <TaskChecklist task={daily} onComplete={handleLegacyTaskComplete} />
              </VStack>
            )}

            {phase === 0 && !daily && (
              <VStack spacing={4}>
                <Text color="gray.500" fontSize="sm">
                  Нет практического задания — отметь итог.
                </Text>
                <Button colorScheme="purple" onClick={() => setPhase(1)}>
                  К итогу
                </Button>
              </VStack>
            )}

            {phase === 1 && (
              <ReportForm onSubmit={handleReportSubmit} isLoading={submitReport.isLoading} />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      <Modal isOpen={theoryModal.isOpen} onClose={theoryModal.onClose} size="full">
        <ModalOverlay />
        <ModalContent mx={4} my={8} borderRadius="xl">
          <ModalHeader>Как это работает</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {lessonMeta.why && (
              <Text fontSize="sm" color="gray.700" mb={4}>
                {lessonMeta.why}
              </Text>
            )}
            {lesson.steps?.map((step) => (
              <TheoryStep key={step.id} step={step} />
            ))}
            {lesson.theory && (
              <Accordion allowToggle mt={4}>
                <AccordionItem border="none">
                  <AccordionButton px={0}>
                    <BookOpen size={16} />
                    <Text flex={1} textAlign="left" ml={2} fontWeight="medium">
                      Подробная теория
                    </Text>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} pt={2}>
                    <Box
                      p={4}
                      bg="blue.50"
                      borderRadius="lg"
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                      lineHeight="1.7"
                    >
                      {lesson.theory}
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
