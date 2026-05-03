import { Box, VStack, HStack, Text, Button, Progress, Skeleton, Badge } from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { Play, CheckCircle } from 'lucide-react';
import { useTodayLesson } from '../../hooks/useLessons';

function shortTitle(title) {
  if (!title) return '';
  return title.replace(/^День\s+\d+:\s*/i, '').trim();
}

export default function TodayLesson() {
  const navigate = useNavigate();
  const { data, isLoading } = useTodayLesson();

  if (isLoading) {
    return <Skeleton h="140px" borderRadius="xl" />;
  }

  if (!data?.lesson) {
    return (
      <Box
        p={5}
        bg="green.50"
        border="1px solid"
        borderColor="green.200"
        borderRadius="xl"
      >
        <VStack align="stretch" spacing={2}>
          <HStack>
            <CheckCircle size={22} color="#38A169" />
            <Text fontWeight="semibold" color="green.800">
              Сегодня всё сделано ✅
            </Text>
          </HStack>
          <Text fontSize="sm" color="green.700">
            Возвращайся завтра за новым шагом.
          </Text>
          <Button as={Link} to="/train" size="sm" variant="outline" colorScheme="green">
            Открыть тренировку
          </Button>
        </VStack>
      </Box>
    );
  }

  const { lesson, module, course } = data;
  const meta = lesson.meta && typeof lesson.meta === 'object' ? lesson.meta : {};
  const moduleProgress = module.total > 0 ? (module.done / module.total) * 100 : 0;
  const title = shortTitle(lesson.title);

  return (
    <Box
      p={5}
      bg="white"
      border="1px solid"
      borderColor="purple.100"
      borderRadius="xl"
      shadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" flexWrap="wrap">
          <Badge colorScheme="purple" borderRadius="md">
            Сегодня
          </Badge>
          <Text fontSize="xs" color="gray.400">
            {course?.title} · день {module.done + 1} из {module.total}
          </Text>
        </HStack>

        <Box>
          <Text fontWeight="bold" fontSize="lg" lineHeight="short">
            {title}
          </Text>
          {lesson.description && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              Цель: {lesson.description}
            </Text>
          )}
          {meta.why && (
            <Text fontSize="xs" color="gray.500" mt={2}>
              {meta.why}
            </Text>
          )}
        </Box>

        <Box>
          <Progress value={moduleProgress} colorScheme="purple" size="xs" borderRadius="full" />
        </Box>

        <Button
          colorScheme="purple"
          size="lg"
          h="12"
          borderRadius="xl"
          leftIcon={<Play size={18} />}
          onClick={() => navigate(`/lesson/${lesson.id}`)}
        >
          Начать
        </Button>
      </VStack>
    </Box>
  );
}
