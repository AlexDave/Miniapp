import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, VStack, HStack, Text, Button, Badge, Divider,
  Spinner, Center, Alert, AlertIcon, Stepper, Step,
  StepIndicator, StepStatus, StepIcon, StepNumber,
  StepTitle, StepSeparator, useSteps,
} from '@chakra-ui/react';
import { ArrowLeft, BookOpen, Dumbbell, FileText } from 'lucide-react';
import { useLesson } from '../../hooks/useLessons';
import { useSubmitReport } from '../../hooks/useLessons';
import TaskChecklist from './TaskChecklist';
import ReportForm from './ReportForm';
import XPAnimation from '../gamification/XPAnimation';
import TheoryStep from './TheoryStep';

const STEPS = [
  { title: 'Теория', icon: BookOpen },
  { title: 'Задание', icon: Dumbbell },
  { title: 'Отчёт', icon: FileText },
];

export default function LessonView() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useLesson(lessonId);
  const submitReport = useSubmitReport();

  const { activeStep, setActiveStep } = useSteps({ index: 0, count: STEPS.length });
  const [taskStepsData, setTaskStepsData] = useState([]);
  const [xpResult, setXpResult] = useState(null);

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="lg" color="blue.500" />
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

  // Если урок уже пройден
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

  async function handleReportSubmit({ steps_data, rating, note }) {
    try {
      const result = await submitReport.mutateAsync({
        lessonId: parseInt(lessonId, 10),
        steps_data: [...taskStepsData, ...steps_data],
        rating,
        note,
      });
      setXpResult(result);
    } catch {
      // ошибка показана через toast
    }
  }

  function handleTaskComplete(stepsData) {
    setTaskStepsData(stepsData);
    setActiveStep(2);
  }

  if (xpResult) {
    return <XPAnimation result={xpResult} onContinue={() => navigate('/')} />;
  }

  return (
    <Box pb={20}>
      {/* Шапка */}
      <HStack px={4} py={3} borderBottom="1px solid" borderColor="gray.100">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Box flex={1}>
          <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{lesson.title}</Text>
          <Badge colorScheme="blue" fontSize="xs">+{lesson.xp_reward} XP</Badge>
        </Box>
      </HStack>

      {/* Прогресс шагов */}
      <Box px={4} py={3}>
        <Stepper index={activeStep} size="sm" colorScheme="blue">
          {STEPS.map((step, i) => (
            <Step key={i}>
              <StepIndicator>
                <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
              </StepIndicator>
              <Box>
                <StepTitle fontSize="xs">{step.title}</StepTitle>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider />

      <Box px={4} pt={4}>
        {/* Шаг 1: Теория */}
        {activeStep === 0 && (
          <VStack spacing={4} align="stretch">
            {lesson.steps?.map((step) => (
              <TheoryStep key={step.id} step={step} />
            ))}
            {lesson.theory && (
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
            )}
            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              onClick={() => setActiveStep(1)}
            >
              Понял, к заданию →
            </Button>
          </VStack>
        )}

        {/* Шаг 2: Задание */}
        {activeStep === 1 && (
          <VStack spacing={4} align="stretch">
            {lesson.daily_task ? (
              <>
                <Box>
                  <Text fontWeight="semibold">{lesson.daily_task.title}</Text>
                  {lesson.daily_task.description && (
                    <Text fontSize="sm" color="gray.600" mt={1}>{lesson.daily_task.description}</Text>
                  )}
                  {lesson.daily_task.duration_min && (
                    <Badge colorScheme="gray" mt={1}>~{lesson.daily_task.duration_min} мин</Badge>
                  )}
                </Box>
                <TaskChecklist
                  task={lesson.daily_task}
                  onComplete={handleTaskComplete}
                />
              </>
            ) : (
              <VStack spacing={3}>
                <Text color="gray.500">Для этого урока нет отдельного задания.</Text>
                <Button colorScheme="blue" onClick={() => setActiveStep(2)}>
                  Перейти к отчёту
                </Button>
              </VStack>
            )}
          </VStack>
        )}

        {/* Шаг 3: Отчёт */}
        {activeStep === 2 && (
          <ReportForm
            stepsData={taskStepsData}
            onSubmit={handleReportSubmit}
            isLoading={submitReport.isLoading}
          />
        )}
      </Box>
    </Box>
  );
}
