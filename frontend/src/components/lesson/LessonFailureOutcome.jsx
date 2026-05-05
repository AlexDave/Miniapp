import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Divider,
  Link,
  Spinner,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { MessageCircle, ChevronDown } from 'lucide-react';
import { skillTitleRu } from '../../constants/skillLabels';

function levelFromTree(tree, tier) {
  const k = `L${tier}`;
  const n = tree?.[k];
  if (n && typeof n === 'object') return n;
  return {
    title: tier === 1 ? 'Упрости условия' : tier === 2 ? 'Ещё проще' : 'Минимальный шаг',
    summary: 'Сократи сессию, убери отвлекающие факторы, один чёткий повтор.',
    hints: [],
  };
}

export default function LessonFailureOutcome({
  bonesResult,
  fallbackTree,
  lessonId,
  onRetryAfterFail,
  onHome,
  isRetrying,
}) {
  const [tier, setTier] = useState(1);
  const tree = fallbackTree && typeof fallbackTree === 'object' ? fallbackTree : {};
  const L = levelFromTree(tree, tier);
  const faq = Array.isArray(tree.faq) ? tree.faq : [];
  const hints = Array.isArray(L.hints) ? L.hints : [];
  const l3Fails = bonesResult?.attempts_at_level?.by_tier?.['3'] ?? 0;
  const showTrainer = l3Fails >= 3;

  function rememberTierForNextReport() {
    try {
      sessionStorage.setItem(`lesson_fail_tier_${lessonId}`, String(tier));
    } catch {
      /* ignore */
    }
  }

  return (
    <Box pb={24} px={4}>
      <VStack spacing={5} py={8} align="stretch" maxW="md" mx="auto">
        <Box textAlign="center">
          <Text fontSize="5xl" aria-hidden>💪</Text>
          <Text fontWeight="bold" fontSize="xl" mt={2}>
            Бывает
          </Text>
          <Text fontSize="sm" color="gray.600" mt={1}>
            {bonesResult?.feedback_message}
          </Text>
        </Box>

        <Box
          p={4}
          bg="purple.50"
          borderRadius="xl"
          border="1px solid"
          borderColor="purple.100"
        >
          <Text fontSize="xs" fontWeight="bold" color="purple.700" mb={2} textTransform="uppercase">
            Уровень {tier} из 3
          </Text>
          <Text fontWeight="semibold" fontSize="md" color="gray.800">
            {L.title}
          </Text>
          {L.summary && (
            <Text fontSize="sm" color="gray.700" mt={2} lineHeight="tall">
              {L.summary}
            </Text>
          )}
          {hints.length > 0 && (
            <VStack align="stretch" spacing={1} mt={3}>
              {hints.map((h, i) => (
                <Text key={i} fontSize="sm" color="gray.700">
                  • {h}
                </Text>
              ))}
            </VStack>
          )}
        </Box>

        {showTrainer && (
          <Box
            p={4}
            bg="teal.50"
            borderRadius="xl"
            border="1px solid"
            borderColor="teal.100"
          >
            <Text fontWeight="semibold" fontSize="sm" color="teal.800" mb={2}>
              Спросить у «тренера»
            </Text>
            <Text fontSize="sm" color="gray.700" lineHeight="tall">
              Три раза подряд было тяжело на самом мягком уровне — это сигнал сделать паузу на день
              или сменить контекст (сон, голод, шум). Не гонись за прогрессом: лучше короткая
              сессия без стресса, чем «дожать» собаку.
            </Text>
            <Button
              as={RouterLink}
              to="/chat"
              size="sm"
              colorScheme="teal"
              variant="outline"
              mt={3}
              leftIcon={<MessageCircle size={16} />}
            >
              Открыть чат с подсказками
            </Button>
          </Box>
        )}

        <VStack spacing={3} w="100%">
          <Button
            colorScheme="purple"
            size="lg"
            borderRadius="xl"
            onClick={() => {
              rememberTierForNextReport();
              onRetryAfterFail();
            }}
            isLoading={isRetrying}
            spinner={<Spinner size="sm" />}
          >
            Попробовать снова
          </Button>
          {tier < 3 && (
            <Button
              variant="outline"
              size="md"
              borderRadius="xl"
              rightIcon={<ChevronDown size={18} />}
              onClick={() => setTier((t) => Math.min(3, t + 1))}
            >
              Ещё проще
            </Button>
          )}
        </VStack>

        {faq.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="mutedFg" mb={2} textTransform="uppercase">
                Частые соседние темы
              </Text>
              <VStack align="stretch" spacing={2}>
                {faq.map((item) => (
                  <Link
                    key={item.skill_key}
                    as={RouterLink}
                    to={`/skills?skill=${encodeURIComponent(item.skill_key)}`}
                    fontSize="sm"
                    color="purple.600"
                  >
                    → {item.title || skillTitleRu(item.skill_key)}
                  </Link>
                ))}
              </VStack>
            </Box>
          </>
        )}

        <HStack justify="center" pt={2}>
          <Button variant="ghost" size="sm" onClick={onHome}>
            На главную
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
