import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Input,
  Progress,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Checkbox,
  Select,
  HStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { apiClient } from '../../hooks/useApi';
import config from '../../config';
import {
  DOG_AGE_OPTIONS,
  LEARNING_GOALS,
  PRIMARY_PROBLEM_OPTIONS,
} from '../../constants/onboarding';

const MotionBox = motion(Box);

const STEPS = 5;

// Static route options shown before the API is needed — matches seed data
const ROUTE_OPTIONS = [
  { key: 'puppy-basics',   icon: '🐶', title: 'Щенок с нуля',          description: 'Имя, туалет, первые команды — с нуля до 6 мес.' },
  { key: 'city-dog',       icon: '🏙️', title: 'Городская собака',      description: 'Социализация, прогулки без рывков, надёжный подзыв' },
  { key: 'foundations',    icon: '✋', title: 'Основы послушания',      description: 'Сидеть, лежать, ждать — фундамент управляемости' },
  { key: 'calm-home',      icon: '🏠', title: 'Спокойный дома',         description: 'Лай, одиночество, режим — собака без тревоги' },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const muted = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const routeBorder = useColorModeValue('gray.200', 'gray.600');

  const [step, setStep] = useState(1);
  const [petName, setPetName] = useState('');
  const [dogAge, setDogAge] = useState('under6mo');
  const [goals, setGoals] = useState([]);
  const [primaryProblem, setPrimaryProblem] = useState('');
  const [selectedRouteKey, setSelectedRouteKey] = useState(null);

  const saveMutation = useMutation(
    async () => {
      const learning_goals = LEARNING_GOALS.filter((g) => goals.includes(g.id)).map((g) => g.id);
      const { data } = await apiClient.put(config.api.endpoints.profile, {
        petName: petName.trim() || 'Ваш питомец',
        preferences: {
          onboarding_completed: true,
          dog_age_bucket: dogAge,
          learning_goals,
          primary_problem: primaryProblem || null,
          selected_route_key: selectedRouteKey || null,
        },
      });
      // If route selected, call select endpoint too
      if (selectedRouteKey) {
        try {
          await apiClient.post(`/api/routes/${selectedRouteKey}/select`);
        } catch { /* non-blocking */ }
      }
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['profile'], data);
        queryClient.invalidateQueries(['routes']);
        navigate('/onboarding/recommendations', { replace: true });
      },
      onError: () => {
        toast({
          title: 'Не удалось сохранить',
          description: 'Попробуйте ещё раз.',
          status: 'error',
          duration: 4000,
        });
      },
    }
  );

  const canNext =
    step === 1
      ? petName.trim().length >= 1
      : step === 2
        ? !!dogAge
        : step === 3
          ? goals.length > 0
          : true; // steps 4 and 5 are optional

  function toggleGoal(id) {
    setGoals((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function next() {
    if (step < STEPS) setStep((s) => s + 1);
    else saveMutation.mutate();
  }

  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  return (
    <Box pb={8} pt={2} px={4} maxW="lg" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="xs" color={muted} fontWeight="medium" letterSpacing="wide" mb={2}>
            Шаг {step} из {STEPS}
          </Text>
          <Progress value={(step / STEPS) * 100} colorScheme="purple" size="xs" borderRadius="full" />
        </Box>

        <MotionBox
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          bg={cardBg}
          p={6}
          borderRadius="2xl"
          borderWidth="1px"
          borderColor={cardBorder}
          shadow="sm"
        >
          {step === 1 && (
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Как зовут вашу собаку?</Heading>
              <Text fontSize="sm" color={muted}>
                Кличка будет в приветствиях и напоминаниях.
              </Text>
              <Input
                placeholder="Например, Барбос"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                size="lg"
                autoFocus
              />
            </VStack>
          )}

          {step === 2 && (
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Сколько лет вашему питомцу?</Heading>
              <Text fontSize="sm" color={muted}>
                Так мы подберём курс по возрасту.
              </Text>
              <Select value={dogAge} onChange={(e) => setDogAge(e.target.value)} size="lg">
                {DOG_AGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {step === 3 && (
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Чему хотите научиться?</Heading>
              <Text fontSize="sm" color={muted}>
                Можно выбрать несколько вариантов.
              </Text>
              <Wrap spacing={2}>
                {LEARNING_GOALS.map((g) => (
                  <WrapItem key={g.id}>
                    <Checkbox
                      isChecked={goals.includes(g.id)}
                      onChange={() => toggleGoal(g.id)}
                      colorScheme="purple"
                    >
                      {g.label}
                    </Checkbox>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          )}

          {step === 4 && (
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Главная проблема сейчас</Heading>
              <Text fontSize="sm" color={muted}>
                Необязательно — поможет персонализировать советы позже.
              </Text>
              <Select
                placeholder="Выберите или пропустите"
                value={primaryProblem}
                onChange={(e) => setPrimaryProblem(e.target.value)}
                size="lg"
              >
                {PRIMARY_PROBLEM_OPTIONS.map((o) => (
                  <option key={o.value || 'skip'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {step === 5 && (
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Выберите маршрут</Heading>
              <Text fontSize="sm" color={muted}>
                Персональный путь по навыкам. Можно сменить позже.
              </Text>
              <VStack spacing={2} align="stretch">
                {ROUTE_OPTIONS.map((r) => {
                  const isChosen = selectedRouteKey === r.key;
                  return (
                    <Box
                      key={r.key}
                      as="button"
                      textAlign="left"
                      p={3.5}
                      borderRadius="xl"
                      border="2px solid"
                      borderColor={isChosen ? 'purple.400' : routeBorder}
                      bg={isChosen ? 'purple.50' : 'transparent'}
                      onClick={() => setSelectedRouteKey(isChosen ? null : r.key)}
                      transition="all 0.15s"
                      _hover={{ borderColor: 'purple.300' }}
                    >
                      <HStack spacing={3} justify="space-between">
                        <HStack spacing={3}>
                          <Text fontSize="xl" aria-hidden>{r.icon}</Text>
                          <Box>
                            <Text fontWeight="semibold" fontSize="sm">{r.title}</Text>
                            <Text fontSize="xs" color={muted}>{r.description}</Text>
                          </Box>
                        </HStack>
                        {isChosen && <CheckCircle size={18} color="#805AD5" />}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
              {!selectedRouteKey && (
                <Text fontSize="xs" color={muted} textAlign="center">Можно пропустить и выбрать позже</Text>
              )}
            </VStack>
          )}
        </MotionBox>

        <VStack spacing={3}>
          <Button
            colorScheme="purple"
            size="lg"
            w="full"
            borderRadius="xl"
            isDisabled={!canNext || saveMutation.isLoading}
            isLoading={saveMutation.isLoading}
            onClick={next}
          >
            {step < STEPS ? 'Далее' : 'Готово'}
          </Button>
          {step > 1 && (
            <Button variant="ghost" onClick={back} isDisabled={saveMutation.isLoading}>
              Назад
            </Button>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
