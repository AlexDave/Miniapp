import { useState } from 'react';
import {
  VStack, HStack, Box, Text, Button, Textarea,
} from '@chakra-ui/react';
import { Send } from 'lucide-react';

const RATINGS = [
  { value: 1, emoji: '😕', label: 'Плохо', color: 'red' },
  { value: 2, emoji: '😐', label: 'Нормально', color: 'yellow' },
  { value: 3, emoji: '😊', label: 'Отлично', color: 'green' },
];

export default function ReportForm({ stepsData = [], onSubmit, isLoading }) {
  const [rating, setRating] = useState(2);
  const [note, setNote] = useState('');

  return (
    <VStack spacing={5} align="stretch">
      <Box>
        <Text fontWeight="semibold" mb={3}>Как прошло занятие?</Text>
        <HStack spacing={3} justify="center">
          {RATINGS.map((r) => (
            <Button
              key={r.value}
              onClick={() => setRating(r.value)}
              variant={rating === r.value ? 'solid' : 'outline'}
              colorScheme={rating === r.value ? r.color : 'gray'}
              flexDir="column"
              h="auto"
              py={3}
              px={5}
              borderRadius="xl"
            >
              <Text fontSize="2xl">{r.emoji}</Text>
              <Text fontSize="xs" mt={1}>{r.label}</Text>
            </Button>
          ))}
        </HStack>
      </Box>

      <Box>
        <Text fontSize="sm" color="gray.600" mb={2}>
          Заметка (необязательно)
        </Text>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Что получилось? Что нет? Чего не хватило..."
          rows={3}
          resize="none"
          fontSize="sm"
        />
      </Box>

      <Button
        colorScheme="green"
        leftIcon={<Send size={18} />}
        size="lg"
        w="100%"
        isLoading={isLoading}
        onClick={() => onSubmit({ steps_data: stepsData, rating, note })}
      >
        Сохранить и получить XP
      </Button>
    </VStack>
  );
}
