import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Spinner,
  Center,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import config from '../../config';
import { useProfile } from '../../hooks/useProfile';
import { partitionCoursesByAge } from '../../constants/onboarding';

const MotionCard = motion(Card);

export default function OnboardingRecommendations() {
  const { get } = useApi();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await get(config.api.endpoints.courses);
        if (!cancelled) setCourses(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setCourses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [get]);

  if (profileLoading || loading) {
    return (
      <Center minH="40vh">
        <Spinner color="purple.500" size="lg" />
      </Center>
    );
  }

  if (!profile?.onboardingCompleted || !profile.dogAgeBucket) {
    return (
      <Box px={4} py={8} textAlign="center">
        <Text color={textColor} mb={4}>
          Сначала заполните анкету знакомства.
        </Text>
        <Button as={Link} to="/onboarding" colorScheme="purple">
          К анкете
        </Button>
      </Box>
    );
  }

  const { primary, rest, featured } = partitionCoursesByAge(courses, profile.dogAgeBucket);
  const morePrimary = primary.slice(1, 4);
  const other = [...primary.slice(4), ...rest];

  return (
    <Box pb={24} px={4} pt={2}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" color="purple.600" mb={2}>
            Мы подобрали для вас
          </Heading>
          <Text fontSize="sm" color={textColor}>
            Курс под возраст собаки; остальные — ниже.
          </Text>
        </Box>

        {featured && (
          <MotionCard
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            bg={bg}
            borderWidth="1px"
            borderColor="purple.200"
            shadow="md"
            overflow="hidden"
          >
            <CardBody>
              <Badge colorScheme="purple" mb={2}>
                Рекомендуем начать
              </Badge>
              <Heading size="md" mb={2}>
                {featured.title}
              </Heading>
              <Text fontSize="sm" color={textColor} noOfLines={4} mb={4}>
                {featured.description}
              </Text>
              <Button
                as={Link}
                to={`/course/${featured.id}`}
                colorScheme="purple"
                size="lg"
                w="full"
                borderRadius="xl"
                rightIcon={<ArrowRight size={18} />}
              >
                Начать с этого курса
              </Button>
            </CardBody>
          </MotionCard>
        )}

        {morePrimary.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={3}>
              Ещё подходящие по возрасту
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {morePrimary.map((course) => (
                <Card
                  key={course.id}
                  as={Link}
                  to={`/course/${course.id}`}
                  bg={bg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  _hover={{ borderColor: 'purple.300' }}
                >
                  <CardBody>
                    <HStack mb={2} color="purple.500">
                      <BookOpen size={18} />
                      <Text fontWeight="bold" fontSize="sm" noOfLines={2}>
                        {course.title}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color={textColor} noOfLines={2}>
                      {course.description}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {other.length > 0 && (
          <Box>
            <Text fontWeight="semibold" mb={3}>
              Другие курсы
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {other.map((course) => (
                <Card
                  key={course.id}
                  as={Link}
                  to={`/course/${course.id}`}
                  bg={bg}
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <CardBody>
                    <Text fontWeight="bold" fontSize="sm" noOfLines={2} mb={1}>
                      {course.title}
                    </Text>
                    <Badge fontSize="xs">{course.category}</Badge>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Button as={Link} to="/" variant="outline" colorScheme="purple" size="lg" borderRadius="xl">
          На главную
        </Button>
      </VStack>
    </Box>
  );
}
