import { Box, Text, VStack, HStack, Badge, Skeleton, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useBehavior } from '../../hooks/useBehavior';

const TYPE_EMOJI = {
  barking: '🔊',
  accident: '🚿',
  escape: '🏃',
  aggression: '⚡',
  chewing: '🦴',
  other: '📝',
};

function formatWhen(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default function BehaviorTimeline() {
  const { data, isLoading, error } = useBehavior(30);

  if (isLoading) {
    return <Skeleton height="120px" borderRadius="lg" />;
  }
  if (error || !data?.events?.length) {
    return (
      <Text fontSize="sm" color="mutedFg">
        Пока нет записей. Отметьте инцидент на главной — так проще подобрать уроки.
      </Text>
    );
  }

  const highlights = data.stats?.highlights ?? [];

  return (
    <VStack align="stretch" spacing={3}>
      {highlights.length > 0 && (
        <Box p={3} bg="green.50" borderRadius="lg" borderWidth="1px" borderColor="green.100">
          {highlights.map((h) => (
            <Text key={h} fontSize="sm" color="green.800">{h}</Text>
          ))}
        </Box>
      )}
      <VStack align="stretch" spacing={2} maxH="240px" overflowY="auto">
        {data.events.slice(0, 20).map((e) => (
          <Box
            key={e.id}
            py={2}
            px={3}
            bg="gray.50"
            borderRadius="md"
            borderLeft="3px solid"
            borderLeftColor="purple.400"
          >
            <HStack justify="space-between" align="start" spacing={2}>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {TYPE_EMOJI[e.type] || '📝'} {e.suggested_skill_title ? (
                    <>
                      <Badge colorScheme="purple" variant="subtle" mr={1}>{e.type}</Badge>
                      <Link
                        as={RouterLink}
                        to={`/skills?skill=${encodeURIComponent(e.suggested_skill_key)}`}
                        fontSize="xs"
                        color="purple.600"
                      >
                        → {e.suggested_skill_title}
                      </Link>
                    </>
                  ) : (
                    <Badge colorScheme="gray">{e.type}</Badge>
                  )}
                </Text>
                {e.note && (
                  <Text fontSize="xs" color="gray.600" mt={1} noOfLines={2}>{e.note}</Text>
                )}
              </Box>
              <Text fontSize="xs" color="mutedFg" whiteSpace="nowrap">{formatWhen(e.created_at)}</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
}
