import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Button,
  Spinner,
  VStack,
  HStack,
  IconButton,
  Badge,
  Progress,
  AspectRatio,
  Divider,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useCourseLessons } from '../hooks/useLessons';
import { apiClient } from '../hooks/useApi';
import { lessonNavState } from '../constants/bottomNav';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const lessonDoneBg = useColorModeValue('green.50', 'green.900');
  const lessonDoneBorder = useColorModeValue('green.200', 'green.700');

  const { data: lessons = [], isLoading: lessonsLoading } = useCourseLessons(id);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await apiClient.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch {
        setError('Не удалось загрузить программу');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  if (loading) {
    return <Center h="50vh"><Spinner size="lg" color="purple.500" /></Center>;
  }

  if (error) {
    return (
      <VStack spacing={4} py={16} px={4} align="center">
        <Text color="red.500" fontWeight="semibold">{error}</Text>
        <Button variant="outline" colorScheme="purple" onClick={() => navigate('/library')}>
          Вернуться в библиотеку
        </Button>
      </VStack>
    );
  }

  const completedCount = lessons.filter((l) => l.is_completed).length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const videoUrl = course?.video_url || course?.videoUrl;

  return (
    <Box pb={20}>
      <HStack px={4} py={3} spacing={3} borderBottom="1px solid" borderColor={borderColor}>
        <IconButton
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/library')}
          variant="ghost"
          size="sm"
          aria-label="Назад в библиотеку"
        />
        <Text fontWeight="bold" fontSize="md" noOfLines={1} flex={1} color="purple.700" _dark={{ color: 'purple.300' }}>
          {course?.title}
        </Text>
      </HStack>

      <VStack spacing={5} px={4} pt={5} align="stretch">
        {course?.description && (
          <Text fontSize="sm" color={muted} lineHeight="1.75">
            {course.description}
          </Text>
        )}

        {lessons.length > 0 && (
          <Box>
            <HStack justify="space-between" mb={1.5}>
              <Text fontSize="xs" color={muted}>Прогресс курса</Text>
              <Text fontSize="xs" fontWeight="semibold" color={muted}>
                {completedCount} / {lessons.length} уроков
              </Text>
            </HStack>
            <Progress value={progressPct} colorScheme="purple" size="sm" borderRadius="full" />
          </Box>
        )}

        {videoUrl && (
          <AspectRatio ratio={16 / 9} borderRadius="xl" overflow="hidden" boxShadow="sm">
            <iframe
              src={videoUrl}
              title={course?.title}
              frameBorder="0"
              allowFullScreen
              style={{ width: '100%', height: '100%' }}
            />
          </AspectRatio>
        )}

        <Divider />

        <Box>
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="semibold" fontSize="sm">Уроки</Text>
            {lessons.length > 0 && (
              <Text fontSize="xs" color={muted}>
                {completedCount} / {lessons.length}
              </Text>
            )}
          </HStack>

          {lessonsLoading ? (
            <Center py={6}><Spinner size="sm" color="purple.500" /></Center>
          ) : lessons.length > 0 ? (
            <VStack spacing={2} align="stretch">
              {lessons.map((lesson, index) => {
                const isDone = lesson.is_completed;
                return (
                  <Box
                    key={lesson.id}
                    as="button"
                    textAlign="left"
                    p={3.5}
                    border="1px solid"
                    borderColor={isDone ? lessonDoneBorder : borderColor}
                    borderRadius="xl"
                    bg={isDone ? lessonDoneBg : bg}
                    onClick={() => navigate(`/lesson/${lesson.id}`, { state: lessonNavState('/library') })}
                    _hover={{ borderColor: 'purple.300', boxShadow: 'sm' }}
                    transition="all 0.15s"
                    w="100%"
                  >
                    <HStack spacing={3}>
                      <Box
                        w="28px"
                        h="28px"
                        flexShrink={0}
                        borderRadius="full"
                        bg={isDone ? 'green.500' : 'purple.50'}
                        border="1px solid"
                        borderColor={isDone ? 'green.400' : 'purple.200'}
                        _dark={{ bg: isDone ? 'green.500' : 'whiteAlpha.100', borderColor: isDone ? 'green.400' : 'purple.500' }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {isDone ? (
                          <CheckCircle size={14} color="white" />
                        ) : (
                          <Text fontSize="xs" fontWeight="bold" color="purple.600" _dark={{ color: 'purple.300' }}>
                            {index + 1}
                          </Text>
                        )}
                      </Box>
                      <Box flex={1} minW={0}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={2}>
                          {lesson.title}
                        </Text>
                        {lesson.description && (
                          <Text fontSize="xs" color={muted} noOfLines={1} mt={0.5}>
                            {lesson.description}
                          </Text>
                        )}
                      </Box>
                      {!isDone && (
                        <Badge colorScheme="purple" variant="subtle" fontSize="xs" flexShrink={0}>
                          +{Math.max(1, Math.floor((lesson.xp_reward ?? 10) / 10))} 🦴
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          ) : (
            <Text fontSize="sm" color={muted}>Уроки появятся скоро</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
}

export default CourseDetail;
