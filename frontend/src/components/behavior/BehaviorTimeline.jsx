import { Box, Text, VStack, HStack, Badge, Skeleton, Link, useColorModeValue } from '@chakra-ui/react';
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

/** Подписи как в форме «Отметить инцидент» — в журнале не показываем сырой id. */
const TYPE_LABEL_RU = {
  barking: 'Лай / вой',
  accident: 'Туалет',
  escape: 'Побег / срыв',
  aggression: 'Агрессия / напор',
  chewing: 'Грызёт / кусает',
  other: 'Другое',
};

function typeLabelRu(type) {
  if (type == null || type === '') return '';
  return TYPE_LABEL_RU[type] ?? type;
}

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

  const highlightBg = useColorModeValue('green.50', 'green.900');
  const highlightBorder = useColorModeValue('green.200', 'green.600');
  const highlightText = useColorModeValue('green.800', 'green.100');
  const rowBg = useColorModeValue('gray.50', 'gray.700');
  const rowBorder = useColorModeValue('gray.100', 'gray.600');
  const noteColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'gray.100');
  const linkColor = useColorModeValue('purple.600', 'purple.300');

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
        <Box p={3} bg={highlightBg} borderRadius="lg" borderWidth="1px" borderColor={highlightBorder}>
          {highlights.map((h) => (
            <Text key={h} fontSize="sm" color={highlightText}>
              {h}
            </Text>
          ))}
        </Box>
      )}
      <VStack align="stretch" spacing={2} maxH="240px" overflowY="auto">
        {data.events.slice(0, 20).map((e) => (
          <Box
            key={e.id}
            py={2}
            px={3}
            bg={rowBg}
            borderRadius="md"
            borderWidth="1px"
            borderColor={rowBorder}
            borderLeft="3px solid"
            borderLeftColor="purple.400"
          >
            <HStack justify="space-between" align="start" spacing={2}>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="medium" color={titleColor}>
                  {TYPE_EMOJI[e.type] || '📝'}{' '}
                  {e.suggested_skill_title ? (
                    <>
                      <Badge colorScheme="purple" variant="subtle" mr={1}>
                        {typeLabelRu(e.type)}
                      </Badge>
                      <Link
                        as={RouterLink}
                        to={`/skills?skill=${encodeURIComponent(e.suggested_skill_key)}`}
                        fontSize="xs"
                        color={linkColor}
                        fontWeight="medium"
                        _hover={{ color: linkColor, textDecoration: 'underline' }}
                      >
                        → {e.suggested_skill_title}
                      </Link>
                    </>
                  ) : (
                    <Badge colorScheme="gray" variant="subtle">
                      {typeLabelRu(e.type)}
                    </Badge>
                  )}
                </Text>
                {e.note && (
                  <Text fontSize="xs" color={noteColor} mt={1} noOfLines={2}>
                    {e.note}
                  </Text>
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
