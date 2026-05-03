import { useState } from 'react';
import {
  VStack, HStack, Box, Text, Textarea, Button,
} from '@chakra-ui/react';
import PressableButton from '../motion/PressableButton';
import { Send } from 'lucide-react';

const OUTCOMES = [
  { value: 'yes', emoji: '😄', label: 'Отлично', color: 'green' },
  { value: 'partial', emoji: '😐', label: 'Норм', color: 'orange' },
  { value: 'no', emoji: '😕', label: 'Не получилось', color: 'red' },
];

export default function ReportForm({
  onSubmit,
  isLoading,
  fallbackTasks = [],
  initialSuccess = 'yes',
}) {
  const [success, setSuccess] = useState(initialSuccess);
  const [note, setNote] = useState('');

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Text fontWeight="bold" fontSize="lg" mb={1}>
          Как прошло?
        </Text>
        <Text fontSize="sm" color="mutedFg">
          Честно — так лучше для прогресса
        </Text>
      </Box>

      {success === 'no' && fallbackTasks.length > 0 && (
        <Box px={3} py={3} bg="purple.50" borderRadius="xl" borderWidth="1px" borderColor="purple.100" textAlign="left">
          <Text fontSize="xs" fontWeight="bold" color="purple.700" mb={2}>
            Если не вышло — это не провал
          </Text>
          <Text fontSize="sm" color="gray.600" mb={2}>
            После отправки мы подскажем упрощённые шаги из урока. Загляни в итог или попробуй:
          </Text>
          {fallbackTasks.slice(0, 4).map((t, i) => (
            <Text key={i} fontSize="sm" color="gray.700">• {t}</Text>
          ))}
        </Box>
      )}

      <HStack spacing={3} justify="center" flexWrap="wrap">
        {OUTCOMES.map((r) => (
          <Button
            key={r.value}
            onClick={() => setSuccess(r.value)}
            variant={success === r.value ? 'solid' : 'outline'}
            colorScheme={success === r.value ? r.color : 'gray'}
            flexDir="column"
            h="auto"
            py={4}
            px={6}
            borderRadius="2xl"
            minW="100px"
          >
            <Text fontSize="3xl">{r.emoji}</Text>
            <Text fontSize="sm" mt={1} fontWeight="medium">
              {r.label}
            </Text>
          </Button>
        ))}
      </HStack>

      <Box>
        <Text fontSize="sm" color="gray.600" mb={2}>
          Заметка (необязательно)
        </Text>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Лакомство? Отвлечения?"
          rows={2}
          resize="none"
          fontSize="sm"
        />
      </Box>

      <PressableButton
        colorScheme="green"
        leftIcon={<Send size={18} />}
        size="lg"
        fullWidth
        isLoading={isLoading}
        isDisabled={isLoading}
        successTap
        onClick={() => onSubmit({ success, note })}
      >
        Завершить тренировку
      </PressableButton>
    </VStack>
  );
}
