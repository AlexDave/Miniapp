import { Box, VStack, HStack, Text, Button, Progress, Skeleton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';
import { useTodayLesson } from '../../hooks/useLessons';

export default function TodayLesson() {
  const navigate = useNavigate();
  const { data, isLoading } = useTodayLesson();

  if (isLoading) {
    return <Skeleton h="120px" borderRadius="xl" />;
  }

  if (!data?.lesson) {
    return (
      <Box
        p={4}
        bg="green.50"
        border="1px solid"
        borderColor="green.200"
        borderRadius="xl"
      >
        <HStack>
          <CheckCircle size={20} color="#38A169" />
          <Text fontSize="sm" fontWeight="medium" color="green.700">
            Все уроки выполнены! Возвращайся завтра.
          </Text>
        </HStack>
      </Box>
    );
  }

  const { lesson, module, course } = data;
  const moduleProgress = module.total > 0 ? (module.done / module.total) * 100 : 0;

  return (
    <Box
      p={4}
      bg="white"
      border="1px solid"
      borderColor="blue.100"
      borderRadius="xl"
      shadow="sm"
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            {course?.title}
          </Text>
          <Text fontSize="xs" color="gray.400">
            День {module.done + 1} из {module.total}
          </Text>
        </HStack>

        <Box>
          <Text fontWeight="semibold" fontSize="md" lineHeight="1.3">
            {lesson.title}
          </Text>
          {module.title && (
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              Модуль: {module.title}
            </Text>
          )}
        </Box>

        <Box>
          <Progress
            value={moduleProgress}
            colorScheme="blue"
            size="xs"
            borderRadius="full"
          />
          <Text fontSize="xs" color="gray.400" mt={1}>
            {module.done} из {module.total} уроков модуля
          </Text>
        </Box>

        <Button
          colorScheme="blue"
          leftIcon={<BookOpen size={16} />}
          size="sm"
          onClick={() => navigate(`/lesson/${lesson.id}`)}
        >
          Начать урок · +{lesson.xp_reward} XP
        </Button>
      </VStack>
    </Box>
  );
}
