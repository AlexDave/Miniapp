import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Skeleton,
  useColorModeValue,
} from '@chakra-ui/react';
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

  const doneBg = useColorModeValue('green.50', 'rgba(34, 84, 61, 0.35)');
  const doneBorder = useColorModeValue('green.200', 'green.600');
  const doneTitle = useColorModeValue('green.800', 'green.100');
  const doneBody = useColorModeValue('green.700', 'green.200');
  const lessonBg = useColorModeValue('white', 'gray.800');
  const lessonBorder = useColorModeValue('purple.100', 'purple.500');
  const metaColor = useColorModeValue('gray.500', 'gray.400');
  const doneIconColor = useColorModeValue('green.600', 'green.300');

  if (isLoading) {
    return <Skeleton h="140px" borderRadius="xl" />;
  }

  if (!data?.lesson) {
    return (
      <Box p={5} bg={doneBg} border="1px solid" borderColor={doneBorder} borderRadius="xl">
        <VStack align="stretch" spacing={2}>
          <HStack color={doneIconColor}>
            <CheckCircle size={22} />
            <Text fontWeight="semibold" color={doneTitle}>
              Сегодня всё сделано
            </Text>
          </HStack>
          <Text fontSize="sm" color={doneBody}>
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
  const moduleProgress = module.total > 0 ? (module.done / module.total) * 100 : 0;
  const title = shortTitle(lesson.title);

  return (
    <Box
      p={5}
      bg={lessonBg}
      border="1px solid"
      borderColor={lessonBorder}
      borderRadius="xl"
      shadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontSize="xs" color={metaColor} mb={1}>
            Сегодня · день {module.done + 1} из {module.total}
            {course?.title ? ` · ${course.title}` : ''}
          </Text>
          <Text fontWeight="bold" fontSize="xl" lineHeight="short">
            {title}
          </Text>
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
          onClick={() => navigate('/train')}
        >
          Начать
        </Button>
      </VStack>
    </Box>
  );
}
