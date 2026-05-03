import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, VStack, HStack, Heading, Text, Button, Checkbox, CheckboxGroup,
  Progress, Badge, Card, CardBody, Spinner, Flex, Icon,
  useColorModeValue, useToast, Alert, AlertIcon, Divider,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Zap, Trophy, Star } from 'lucide-react';
import { useLesson, useCompleteLesson } from '../hooks/useLessons';

const MotionBox = motion(Box);

function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: lesson, isLoading } = useLesson(id);
  const completeLesson = useCompleteLesson();

  const [checkedItems, setCheckedItems] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const theoryBg = useColorModeValue('purple.50', 'gray.700');

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );
  }

  if (!lesson) {
    return (
      <Box p={4}>
        <Text>Урок не найден</Text>
        <Button mt={4} onClick={() => navigate(-1)}>Назад</Button>
      </Box>
    );
  }

  const checklist = lesson.checklist || [];
  const requiredItems = checklist.filter((item) => item.required).map((item) => String(item.id));
  const allRequiredChecked = requiredItems.every((id) => checkedItems.includes(id));
  const completionProgress = checklist.length > 0 ? Math.round((checkedItems.length / checklist.length) * 100) : 100;

  const handleComplete = async () => {
    if (!allRequiredChecked) {
      toast({ title: 'Выполните все обязательные пункты', status: 'warning', duration: 3000 });
      return;
    }

    try {
      const result = await completeLesson.mutateAsync(parseInt(id, 10));
      setCompletionResult(result);
      setShowCelebration(true);

      if (result.new_achievements?.length > 0) {
        result.new_achievements.forEach((a) => {
          toast({ title: `Достижение разблокировано: ${a.name}!`, status: 'success', duration: 5000 });
        });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Ошибка при завершении урока';
      toast({ title: msg, status: 'error', duration: 3000 });
    }
  };

  if (showCelebration && completionResult) {
    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        pb={20}
      >
        <VStack spacing={6} align="center" py={10} px={4}>
          <Box fontSize="6xl">🎉</Box>
          <Heading color="purple.600" textAlign="center">Урок завершён!</Heading>

          <Card bg={bg} border="1px solid" borderColor={borderColor} w="full" maxW="400px">
            <CardBody>
              <VStack spacing={4}>
                <HStack>
                  <Icon as={Zap} color="yellow.500" w={6} h={6} />
                  <Text fontWeight="bold" fontSize="xl">+{completionResult.xp_earned} XP</Text>
                </HStack>
                {completionResult.leveled_up && (
                  <Alert status="success" borderRadius="lg">
                    <AlertIcon />
                    Новый уровень {completionResult.level}!
                  </Alert>
                )}
                {completionResult.new_achievements?.length > 0 && (
                  <VStack align="start" w="full" spacing={2}>
                    <Text fontWeight="semibold" color={textColor}>Новые достижения:</Text>
                    {completionResult.new_achievements.map((a) => (
                      <HStack key={a.id}>
                        <Icon as={Trophy} color="yellow.500" />
                        <Text>{a.name}</Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>

          <VStack spacing={3} w="full" maxW="400px">
            <Button colorScheme="purple" w="full" onClick={() => navigate(-1)}>
              Назад
            </Button>
            <Button variant="ghost" w="full" onClick={() => navigate('/')}>
              На главную
            </Button>
          </VStack>
        </VStack>
      </MotionBox>
    );
  }

  return (
    <Box pb={24}>
      {/* Header */}
      <HStack mb={6} spacing={3}>
        <Button variant="ghost" leftIcon={<ArrowLeft size={18} />} onClick={() => navigate(-1)} size="sm">
          Назад
        </Button>
        {lesson.is_completed && (
          <Badge colorScheme="green" display="flex" alignItems="center" gap={1}>
            <CheckCircle size={12} /> Выполнен
          </Badge>
        )}
      </HStack>

      <VStack spacing={6} align="stretch">
        {/* Title */}
        <MotionBox initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Heading size="lg" color="purple.600" mb={2}>{lesson.title}</Heading>
          <HStack spacing={3}>
            <HStack>
              <Icon as={Star} w={4} h={4} color="yellow.500" />
              <Text fontSize="sm" color={textColor}>{lesson.xp_reward} XP</Text>
            </HStack>
          </HStack>
        </MotionBox>

        {/* Theory */}
        {lesson.theory && (
          <Card bg={theoryBg} border="none">
            <CardBody>
              <Text fontWeight="semibold" mb={3} color="purple.700">Теория</Text>
              <Box
                fontSize="sm"
                color={useColorModeValue('gray.700', 'gray.200')}
                sx={{
                  '& h2': { fontWeight: 'bold', fontSize: 'md', mb: 2, mt: 4 },
                  '& h3': { fontWeight: 'semibold', mb: 1, mt: 3 },
                  '& p': { mb: 2 },
                  '& ul': { pl: 4, mb: 2 },
                  '& li': { mb: 1 },
                }}
              >
                {lesson.theory.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <Text key={i} fontWeight="bold" fontSize="md" mt={3} mb={1}>{line.slice(3)}</Text>;
                  if (line.startsWith('### ')) return <Text key={i} fontWeight="semibold" mt={2} mb={1}>{line.slice(4)}</Text>;
                  if (line.startsWith('- ')) return <Text key={i} pl={3} mb={1}>• {line.slice(2)}</Text>;
                  if (line.trim() === '') return <Box key={i} h={2} />;
                  return <Text key={i} mb={1}>{line}</Text>;
                })}
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Checklist */}
        {checklist.length > 0 && (
          <Card bg={bg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="semibold">Практическое задание</Text>
                  <Text fontSize="sm" color={textColor}>{checkedItems.length}/{checklist.length}</Text>
                </HStack>
                <Progress value={completionProgress} colorScheme="purple" size="sm" borderRadius="full" />

                <CheckboxGroup value={checkedItems} onChange={setCheckedItems}>
                  <VStack align="stretch" spacing={3}>
                    {checklist.map((item) => (
                      <Checkbox
                        key={item.id}
                        value={String(item.id)}
                        colorScheme="purple"
                        isDisabled={lesson.is_completed}
                      >
                        <HStack spacing={2}>
                          <Text fontSize="sm">{item.text}</Text>
                          {item.required && (
                            <Badge colorScheme="red" fontSize="xs" variant="subtle">обязательно</Badge>
                          )}
                        </HStack>
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Complete button */}
        {!lesson.is_completed && (
          <Button
            colorScheme="purple"
            size="lg"
            w="full"
            isDisabled={!allRequiredChecked}
            isLoading={completeLesson.isLoading}
            onClick={handleComplete}
            leftIcon={<CheckCircle size={18} />}
          >
            Завершить урок (+{lesson.xp_reward} XP)
          </Button>
        )}

        {lesson.is_completed && (
          <Alert status="success" borderRadius="lg">
            <AlertIcon />
            Урок уже выполнен! Отличная работа.
          </Alert>
        )}
      </VStack>
    </Box>
  );
}

export default LessonView;
