import { useState } from 'react';
import {
  VStack, HStack, Box, Text, Button, Checkbox, NumberInput,
  NumberInputField, NumberInputStepper, NumberIncrementStepper,
  NumberDecrementStepper, Textarea, Progress,
} from '@chakra-ui/react';
import { CheckCircle } from 'lucide-react';
import PressableButton from '../motion/PressableButton';

const RATINGS = [
  { value: 1, emoji: '😕', label: 'Плохо' },
  { value: 2, emoji: '😐', label: 'Нормально' },
  { value: 3, emoji: '😊', label: 'Отлично' },
];

function StepRenderer({ step, value, onChange }) {
  if (step.type === 'checkbox') {
    return (
      <Checkbox
        isChecked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        size="lg"
        colorScheme="green"
      >
        <Text fontSize="sm">{step.label}</Text>
      </Checkbox>
    );
  }

  if (step.type === 'counter') {
    return (
      <Box w="100%">
        <Text fontSize="sm" mb={1}>{step.label}</Text>
        <NumberInput
          min={0}
          max={step.max_value ?? 100}
          value={value ?? 0}
          onChange={(_, num) => onChange(isNaN(num) ? 0 : num)}
          size="sm"
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </Box>
    );
  }

  if (step.type === 'rating') {
    return (
      <Box w="100%">
        <Text fontSize="sm" mb={2}>{step.label}</Text>
        <HStack spacing={3}>
          {RATINGS.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={value === r.value ? 'solid' : 'outline'}
              colorScheme={value === r.value ? 'green' : 'gray'}
              onClick={() => onChange(r.value)}
              flexDir="column"
              h="auto"
              py={2}
            >
              <Text fontSize="xl">{r.emoji}</Text>
              <Text fontSize="xs">{r.label}</Text>
            </Button>
          ))}
        </HStack>
      </Box>
    );
  }

  if (step.type === 'text') {
    return (
      <Box w="100%">
        <Text fontSize="sm" mb={1}>{step.label}</Text>
        <Textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          size="sm"
          rows={2}
          placeholder="Напиши здесь..."
        />
      </Box>
    );
  }

  return null;
}

export default function TaskChecklist({ task, onComplete }) {
  const [values, setValues] = useState({});

  if (!task) return null;

  const steps = task.steps ?? [];
  const filledCount = steps.filter((s) => {
    const v = values[s.id];
    return v !== undefined && v !== false && v !== '' && v !== 0 && v !== null;
  }).length;
  const progress = steps.length > 0 ? (filledCount / steps.length) * 100 : 0;

  function handleChange(stepId, val) {
    setValues((prev) => ({ ...prev, [stepId]: val }));
  }

  function handleSubmit() {
    const steps_data = steps.map((s) => ({ step_id: s.id, value: values[s.id] ?? null }));
    onComplete(steps_data, values);
  }

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <HStack justify="space-between" mb={1}>
          <Text fontSize="xs" color="mutedFg">Прогресс задания</Text>
          <Text fontSize="xs" color="mutedFg">{filledCount}/{steps.length}</Text>
        </HStack>
        <Progress value={progress} colorScheme="green" size="sm" borderRadius="full" />
      </Box>

      {steps.map((step) => (
        <Box
          key={step.id}
          p={3}
          bg="gray.50"
          _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <StepRenderer
            step={step}
            value={values[step.id]}
            onChange={(val) => handleChange(step.id, val)}
          />
        </Box>
      ))}

      <PressableButton
        colorScheme="green"
        leftIcon={<CheckCircle size={18} />}
        onClick={handleSubmit}
        size="lg"
        fullWidth
        successTap
      >
        Задание выполнено
      </PressableButton>
    </VStack>
  );
}
