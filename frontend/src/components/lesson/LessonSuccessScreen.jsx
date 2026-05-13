import {
  Box,
  VStack,
  Text,
  Button,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, RotateCcw, Home } from 'lucide-react';
import BoneCelebrate from '../gamification/BoneCelebrate';
import { forwardLessonTabState } from '../../constants/bottomNav';

function boneLabel(n) {
  if (n <= 0) return 'Выполнено!';
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return `+${n} косточек`;
  if (n1 === 1) return `+${n} косточка`;
  if (n1 >= 2 && n1 <= 4) return `+${n} косточки`;
  return `+${n} косточек`;
}

function OutcomeShell({ children }) {
  return (
    <Box
      w="100%"
      maxW="md"
      mx="auto"
      px={{ base: 3, sm: 4 }}
      py={{ base: 6, sm: 10 }}
      pb={28}
    >
      <Box
        bg="white"
        borderRadius="2xl"
        boxShadow="0 4px 24px -4px rgba(124, 58, 237, 0.12), 0 8px 16px -8px rgba(0, 0, 0, 0.08)"
        borderWidth="1px"
        borderColor="purple.100"
        overflow="hidden"
        _dark={{
          bg: 'gray.800',
          borderColor: 'whiteAlpha.200',
          boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.45)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** Экран сразу после отправки отчёта: косточка, текст, действия. */
export function LessonJustCompletedScreen({
  bonesResult,
  nextLesson,
  onHome,
  onRepeat,
  isRepeating,
  lessonTitleShort,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const nextLessonLinkState = forwardLessonTabState(location.state);
  const er = bonesResult?.emotional_reward;
  const earned = bonesResult?.bones_earned ?? 0;
  const headline = boneLabel(earned);

  return (
    <Box
      minH="60vh"
      bgGradient="linear(to-b, purple.50, gray.50 45%, gray.50)"
      _dark={{ bgGradient: 'linear(to-b, purple.900, gray.900 50%, gray.900)' }}
    >
      <OutcomeShell>
        <VStack spacing={0} align="stretch" role="status" aria-live="polite" aria-atomic="true">
          <VStack spacing={5} pt={10} pb={6} px={{ base: 5, sm: 8 }} textAlign="center">
            {lessonTitleShort ? (
              <Text fontSize="xs" fontWeight="semibold" color="purple.600" textTransform="uppercase" letterSpacing="0.08em">
                {lessonTitleShort}
              </Text>
            ) : null}

            <Box>
              <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                w="88px"
                h="88px"
                borderRadius="full"
                bg="purple.50"
                borderWidth="2px"
                borderColor="purple.100"
                _dark={{ bg: 'whiteAlpha.100', borderColor: 'purple.400' }}
              >
                <BoneCelebrate>
                  <Text fontSize="4xl" lineHeight="1" aria-hidden>
                    🦴
                  </Text>
                </BoneCelebrate>
              </Box>
            </Box>

            <VStack spacing={2}>
              <Text fontWeight="extrabold" fontSize="2xl" letterSpacing="-0.02em" color="gray.800" _dark={{ color: 'white' }}>
                {headline}
              </Text>
              {er?.skill_bones_target != null ? (
                <Text fontSize="sm" color="mutedFg" fontWeight="medium">
                  {er.skill_bones_current}/{er.skill_bones_target} по навыку «{er.skill_title}»
                </Text>
              ) : null}
            </VStack>

            {bonesResult?.is_special_bone ? (
              <Badge
                colorScheme="orange"
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                textTransform="none"
                boxShadow="sm"
              >
                Особая косточка — 7 дней подряд!
              </Badge>
            ) : null}

            {er?.atomic_outcome ? (
              <Box
                w="100%"
                textAlign="left"
                px={4}
                py={3.5}
                bg="purple.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="purple.100"
                _dark={{ bg: 'whiteAlpha.100', borderColor: 'whiteAlpha.200' }}
              >
                <Text fontSize="sm" lineHeight="tall" color="gray.700" _dark={{ color: 'gray.100' }}>
                  <Text as="span" fontWeight="bold" color="purple.700" _dark={{ color: 'purple.200' }}>
                    {er.pet_name}
                    :{' '}
                  </Text>
                  {er.atomic_outcome}
                </Text>
              </Box>
            ) : null}

            {(bonesResult?.feedback_message || bonesResult?.bones_stage) && (
              <VStack spacing={1} w="100%">
                {bonesResult.feedback_message ? (
                  <Text fontSize="sm" color="mutedFg" lineHeight="tall">
                    {bonesResult.feedback_message}
                  </Text>
                ) : null}
                {bonesResult.bones_stage ? (
                  <Text fontSize="xs" color="purple.600" fontWeight="semibold" _dark={{ color: 'purple.300' }}>
                    Стадия косточек: {bonesResult.bones_stage}
                  </Text>
                ) : null}
              </VStack>
            )}
          </VStack>

          <Divider borderColor="purple.100" _dark={{ borderColor: 'whiteAlpha.200' }} />

          <VStack spacing={3} p={{ base: 5, sm: 6 }} align="stretch">
            {nextLesson ? (
              <Button
                colorScheme="purple"
                size="lg"
                borderRadius="xl"
                h="52px"
                fontWeight="semibold"
                rightIcon={<ChevronRight size={20} />}
                boxShadow="md"
                _hover={{ boxShadow: 'lg', transform: 'translateY(-1px)' }}
                transition="all 0.2s ease"
                onClick={() =>
                  navigate(
                    `/lesson/${nextLesson.id}`,
                    nextLessonLinkState ? { state: nextLessonLinkState } : undefined
                  )
                }
              >
                Перейти к следующему
              </Button>
            ) : null}

            <Button
              colorScheme="purple"
              size="lg"
              borderRadius="xl"
              h="48px"
              variant={nextLesson ? 'outline' : 'solid'}
              leftIcon={<Home size={18} />}
              onClick={onHome}
            >
              На главную
            </Button>

            <Button
              variant="ghost"
              size="md"
              color="mutedFg"
              leftIcon={<RotateCcw size={16} />}
              onClick={onRepeat}
              isLoading={isRepeating}
            >
              Перепройти этот урок
            </Button>
          </VStack>
        </VStack>
      </OutcomeShell>
    </Box>
  );
}

/** Урок уже был завершён ранее — тот же визуальный язык, без анимации награды. */
export function LessonAlreadyCompletedScreen({ nextLesson, onRepeat, isRepeating }) {
  const location = useLocation();
  const navigate = useNavigate();
  const nextLessonLinkState = forwardLessonTabState(location.state);

  return (
    <Box
      minH="50vh"
      bgGradient="linear(to-b, purple.50, gray.50 40%, gray.50)"
      _dark={{ bgGradient: 'linear(to-b, purple.900, gray.900 45%, gray.900)' }}
    >
      <OutcomeShell>
        <VStack spacing={0} align="stretch" textAlign="center">
          <VStack spacing={4} pt={9} pb={6} px={{ base: 5, sm: 8 }}>
            <Text fontSize="xs" fontWeight="bold" color="purple.600" textTransform="uppercase" letterSpacing="wider">
              Уже в копилке
            </Text>
            <Box
              display="inline-flex"
              mx="auto"
              alignItems="center"
              justifyContent="center"
              w="72px"
              h="72px"
              borderRadius="full"
              bg="green.50"
              borderWidth="2px"
              borderColor="green.100"
              _dark={{ bg: 'whiteAlpha.100', borderColor: 'green.500' }}
            >
              <Text fontSize="3xl" aria-hidden>
                🦴
              </Text>
            </Box>
            <VStack spacing={1}>
              <Text fontWeight="extrabold" fontSize="xl" color="gray.800" _dark={{ color: 'white' }}>
                Урок выполнен
              </Text>
              <Text fontSize="sm" color="mutedFg" maxW="xs" mx="auto" lineHeight="tall">
                Косточка за этот урок уже сохранена. Можно перейти дальше или пройти заново для практики.
              </Text>
            </VStack>
          </VStack>

          <Divider borderColor="purple.100" _dark={{ borderColor: 'whiteAlpha.200' }} />

          <VStack spacing={3} p={{ base: 5, sm: 6 }} align="stretch">
            {nextLesson ? (
              <Button
                colorScheme="purple"
                size="lg"
                borderRadius="xl"
                h="52px"
                fontWeight="semibold"
                rightIcon={<ChevronRight size={20} />}
                boxShadow="md"
                onClick={() =>
                  navigate(
                    `/lesson/${nextLesson.id}`,
                    nextLessonLinkState ? { state: nextLessonLinkState } : undefined
                  )
                }
              >
                Перейти к следующему
              </Button>
            ) : null}
            <Button
              colorScheme="purple"
              variant="outline"
              size="lg"
              borderRadius="xl"
              h="48px"
              leftIcon={<RotateCcw size={18} />}
              onClick={onRepeat}
              isLoading={isRepeating}
            >
              Перепройти
            </Button>
            <Button as={RouterLink} to="/" variant="ghost" size="md" color="mutedFg" leftIcon={<Home size={18} />}>
              На главную
            </Button>
          </VStack>
        </VStack>
      </OutcomeShell>
    </Box>
  );
}
