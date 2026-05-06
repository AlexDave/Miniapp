import { Box, VStack, Text, Button, HStack } from '@chakra-ui/react';
import { ChevronLeft } from 'lucide-react';
import TheoryArticle from './TheoryArticle';
import TheoryStep from './TheoryStep';

function SectionHeading({ children }) {
  return (
    <Text
      fontSize="xs"
      fontWeight="bold"
      color="gray.500"
      textTransform="uppercase"
      letterSpacing="wide"
      mb={2}
    >
      {children}
    </Text>
  );
}

export default function LessonMaterialScreen({
  theorySections,
  practiceSteps,
  mistakes,
  tip,
  onNext,
  onBack,
}) {
  const hasTheory = theorySections?.length > 0;
  const hasPractice = practiceSteps?.length > 0;
  const hasMistakes = (mistakes?.length ?? 0) > 0;
  const hasTip = Boolean(tip != null && String(tip).trim());
  const hasPitfalls = hasMistakes || hasTip;
  const hasAny = hasTheory || hasPractice || hasPitfalls;

  return (
    <VStack spacing={4} align="stretch" pt={2} pb={8}>
      <Text fontSize="xs" color="mutedFg" textAlign="center">
        Один экран: теория, пошагово и на что обратить внимание
      </Text>

      <Box maxH="calc(100vh - 260px)" overflowY="auto" pr={1}>
        <VStack spacing={8} align="stretch">
          {!hasAny && (
            <Text fontSize="sm" color="mutedFg" textAlign="center">
              Материал урока пока не загружен. Нажмите «К заданию», чтобы продолжить.
            </Text>
          )}

          {hasTheory && (
            <Box>
              <SectionHeading>Теория</SectionHeading>
              <TheoryArticle sections={theorySections} />
            </Box>
          )}

          {hasPractice && (
            <Box>
              <SectionHeading>Пошагово</SectionHeading>
              <VStack spacing={3} align="stretch">
                {practiceSteps.map((step, i) => (
                  <TheoryStep key={i} step={step} />
                ))}
              </VStack>
            </Box>
          )}

          {hasPitfalls && (
            <Box>
              <SectionHeading>Внимание</SectionHeading>
              <VStack spacing={4} align="stretch">
                {hasMistakes && (
                  <VStack spacing={2} align="stretch">
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                      Частые ошибки
                    </Text>
                    {mistakes.map((m, i) => (
                      <TheoryStep key={i} step={{ type: 'tip', content: `⚠️ ${m}` }} />
                    ))}
                  </VStack>
                )}
                {hasTip && (
                  <VStack spacing={2} align="stretch">
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                      Совет
                    </Text>
                    <TheoryStep step={{ type: 'tip', content: `💡 ${tip != null ? String(tip) : ''}` }} />
                  </VStack>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      </Box>

      <HStack spacing={3}>
        <Button variant="ghost" leftIcon={<ChevronLeft size={16} />} onClick={onBack} flex={1}>
          Назад
        </Button>
        <Button colorScheme="purple" size="lg" borderRadius="xl" onClick={onNext} flex={2}>
          К заданию
        </Button>
      </HStack>
    </VStack>
  );
}
