import { useState } from 'react';
import {
  VStack, HStack, Box, Text, Textarea, Button,
} from '@chakra-ui/react';
import PressableButton from '../motion/PressableButton';
import { Send } from 'lucide-react';

const SUCCESS = [
  { value: 'yes', emoji: '✅', label: 'Да', color: 'green' },
  { value: 'partial', emoji: '⚠️', label: 'Частично', color: 'orange' },
  { value: 'no', emoji: '❌', label: 'Нет', color: 'red' },
];

export default function ReportForm({ stepsData = [], onSubmit, isLoading }) {
  const [success, setSuccess] = useState('yes');
  const [note, setNote] = useState('');

  return (
    <VStack spacing={5} align="stretch">
      <Box>
        <Text fontWeight="semibold" mb={3}>Получилось?</Text>
        <HStack spacing={3} justify="center" flexWrap="wrap">
          {SUCCESS.map((r) => (
            <Button
              key={r.value}
              onClick={() => setSuccess(r.value)}
              variant={success === r.value ? 'solid' : 'outline'}
              colorScheme={success === r.value ? r.color : 'gray'}
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

      <PressableButton
        colorScheme="green"
        leftIcon={<Send size={18} />}
        size="lg"
        fullWidth
        isLoading={isLoading}
        isDisabled={isLoading}
        successTap
        onClick={() => onSubmit({ steps_data: stepsData, success, note })}
      >
        Сохранить и получить XP
      </PressableButton>
    </VStack>
  );
}
