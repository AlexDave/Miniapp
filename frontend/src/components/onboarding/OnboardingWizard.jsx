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
  Select,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from 'react-query';
import { apiClient } from '../../hooks/useApi';
import { DOG_AGE_OPTIONS } from '../../constants/onboarding';

const MotionBox = motion(Box);

const STEPS = 2;

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const muted = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');

  const [step, setStep] = useState(1);
  const [petName, setPetName] = useState('');
  const [dogAge, setDogAge] = useState('under6mo');

  const saveMutation = useMutation(
    async () => {
      const { data } = await apiClient.post('/api/onboarding/complete', {
        petName: petName.trim() || 'Ваш питомец',
        dog_age_bucket: dogAge,
      });
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['profile'], data.profile);
        queryClient.invalidateQueries(['routes']);
        const id = data.first_lesson_id;
        if (id != null) {
          navigate(`/lesson/${id}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
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

  const canNext = step === 1 ? petName.trim().length >= 1 : !!dogAge;

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
                Подберём стартовый маршрут тренировок.
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
            {step < STEPS ? 'Далее' : 'Начать тренировку'}
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
