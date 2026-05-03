import { Box, SimpleGrid, Text, AspectRatio } from '@chakra-ui/react';
import config from '../../config.jsx';

function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/**
 * Сетка коротких видео после уроков (подписанные URL).
 */
export default function TrophyVideoShelf({ videos = [], title = 'Видео-трофеи' }) {
  if (!videos.length) return null;

  const base = config.baseUrl || '';

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="purple.600" mb={2}>
        {title}
      </Text>
      <SimpleGrid columns={2} spacing={3}>
        {videos.map((v) => {
          const src = `${base}${v.stream_url}`;
          const cap = [v.atomic_outcome_snapshot, formatDate(v.created_at)].filter(Boolean).join(' · ');
          return (
            <Box key={v.id} borderRadius="xl" overflow="hidden" borderWidth="1px" borderColor="gray.200">
              <AspectRatio ratio={16 / 9}>
                <video
                  src={src}
                  controls
                  playsInline
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#1a1a1a' }}
                />
              </AspectRatio>
              {cap ? (
                <Text fontSize="xs" color="gray.600" px={2} py={2} noOfLines={3}>
                  {cap}
                </Text>
              ) : null}
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
