import { Box, VStack, Text, Button, HStack, Divider } from '@chakra-ui/react';
import { ChevronLeft, AlertTriangle, Lightbulb } from 'lucide-react';
import TheoryArticle from './TheoryArticle';

function PracticeStep({ step, index }) {
  return (
    <HStack align="flex-start" spacing={3}>
      <Box
        flexShrink={0}
        w="22px"
        h="22px"
        bg="purple.500"
        color="white"
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="xs"
        fontWeight="bold"
        mt="1px"
      >
        {index + 1}
      </Box>
      <Text fontSize="sm" lineHeight="1.65" color="gray.700" _dark={{ color: 'gray.200' }} flex={1}>
        {/* Убираем префикс "1. " если он уже есть в контенте из сида */}
        {typeof step.content === 'string' ? step.content.replace(/^\d+\.\s*/, '') : step.content}
      </Text>
    </HStack>
  );
}

function MistakeItem({ text }) {
  return (
    <HStack align="flex-start" spacing={2}>
      <AlertTriangle size={14} color="#E53E3E" style={{ marginTop: 3, flexShrink: 0 }} />
      <Text fontSize="sm" lineHeight="1.6" color="gray.700" _dark={{ color: 'gray.300' }}>
        {text}
      </Text>
    </HStack>
  );
}

function ProTip({ text }) {
  return (
    <Box
      px={4}
      py={3}
      borderLeft="3px solid"
      borderColor="purple.400"
      bg="purple.50"
      _dark={{ bg: 'purple.900', borderColor: 'purple.400' }}
      borderRadius="0 8px 8px 0"
    >
      <HStack align="flex-start" spacing={2}>
        <Lightbulb size={15} color="#805AD5" style={{ marginTop: 2, flexShrink: 0 }} />
        <Text fontSize="sm" lineHeight="1.65" color="gray.700" _dark={{ color: 'gray.200' }}>
          {text}
        </Text>
      </HStack>
    </Box>
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
  // Фильтруем шаги: пропускаем если content пустой или это только видео без текста
  const visibleSteps = (practiceSteps ?? []).filter(
    (s) => s.content && String(s.content).trim()
  );
  const hasPractice = visibleSteps.length > 0;
  const cleanMistakes = (mistakes ?? []).filter((m) => m && String(m).trim());
  const hasMistakes = cleanMistakes.length > 0;
  const tipStr = tip != null && String(tip).trim() ? String(tip).trim() : null;
  const hasAny = hasTheory || hasPractice || hasMistakes || tipStr;

  return (
    <VStack spacing={4} align="stretch" pt={2} pb={8}>
      <Box maxH="calc(100vh - 220px)" overflowY="auto" pr={1}>
        <VStack spacing={6} align="stretch">
          {!hasAny && (
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Материал урока пока не загружен. Нажмите «К заданию», чтобы продолжить.
            </Text>
          )}

          {hasTheory && (
            <TheoryArticle sections={theorySections} />
          )}

          {hasPractice && (
            <>
              {hasTheory && <Divider />}
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="purple.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={3}
                >
                  Как делать — по шагам
                </Text>
                <VStack spacing={3} align="stretch">
                  {visibleSteps.map((step, i) => (
                    <PracticeStep key={i} step={step} index={i} />
                  ))}
                </VStack>
              </Box>
            </>
          )}

          {(hasMistakes || tipStr) && (
            <>
              <Divider />
              <Box>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  mb={3}
                >
                  На что обратить внимание
                </Text>
                <VStack spacing={3} align="stretch">
                  {hasMistakes && (
                    <VStack spacing={2} align="stretch">
                      {cleanMistakes.map((m, i) => (
                        <MistakeItem key={i} text={m} />
                      ))}
                    </VStack>
                  )}
                  {tipStr && <ProTip text={tipStr} />}
                </VStack>
              </Box>
            </>
          )}
        </VStack>
      </Box>

      <HStack spacing={3}>
        <Button
          variant="ghost"
          leftIcon={<ChevronLeft size={16} />}
          onClick={onBack}
          flex={1}
        >
          Назад
        </Button>
        <Button colorScheme="purple" size="lg" borderRadius="xl" onClick={onNext} flex={2}>
          К заданию
        </Button>
      </HStack>
    </VStack>
  );
}
