import { useRef, useState } from 'react';
import { Box, Text, Button, useToast } from '@chakra-ui/react';
import { useQueryClient } from 'react-query';
import { apiClient } from '../../hooks/useApi';

export default function LessonVictoryVideoUpload({ lessonId, disabled }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  async function onChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ status: 'error', title: 'До 10 МБ' });
      return;
    }
    if (!file.type.startsWith('video/')) {
      toast({ status: 'error', title: 'Нужен видеофайл' });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      await apiClient.post(`/api/lessons/${lessonId}/video`, fd);
      toast({ status: 'success', title: 'Видео в профиле на полке!' });
      queryClient.invalidateQueries(['trophy-videos']);
    } catch (err) {
      toast({
        status: 'error',
        title: err?.response?.data?.error || 'Не удалось загрузить',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box textAlign="center" w="100%" maxW="md">
      <Text fontSize="sm" color="gray.600" mb={2}>
        По желанию — короткое видео успеха (до 10 МБ); заменит предыдущее для этого урока.
      </Text>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={onChange}
        disabled={disabled || loading}
      />
      <Button
        variant="outline"
        size="sm"
        borderRadius="xl"
        isLoading={loading}
        onClick={() => inputRef.current?.click()}
      >
        Загрузить видео-трофей
      </Button>
    </Box>
  );
}
