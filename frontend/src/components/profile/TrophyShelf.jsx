import { Box, HStack, Text, Tooltip, Icon } from '@chakra-ui/react';
import {
  Trophy,
  Star,
  Calendar,
  Target,
  Heart,
  Crown,
  Zap,
  Award,
  BookOpen,
  GraduationCap,
  BarChart,
} from 'lucide-react';

const ICON_MAP = {
  Star,
  Calendar,
  Target,
  Heart,
  Crown,
  Zap,
  Trophy,
  Award,
  BookOpen,
  GraduationCap,
  BarChart,
};

/**
 * Компактная «полка» полученных достижений на главной вкладке профиля.
 */
export default function TrophyShelf({ achievements = [], title = 'Полка трофеев' }) {
  const earned = achievements.filter((a) => a.earned);
  if (earned.length === 0) {
    return (
      <Box
        px={2}
        py={3}
        borderRadius="xl"
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.200"
        _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
      >
        <Text fontSize="xs" color="gray.500" textAlign="center">
          Выполняйте уроки и треки — трофеи появятся здесь.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="purple.600" mb={2}>
        {title}
      </Text>
      <HStack
        spacing={3}
        overflowX="auto"
        py={2}
        px={1}
        sx={{
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: '6px' },
        }}
      >
        {earned.map((a) => {
          const LucideIcon = ICON_MAP[a.icon] || Trophy;
          return (
            <Tooltip key={a.id} label={`${a.name}: ${a.description}`} openDelay={400}>
              <Box
                flexShrink={0}
                w="52px"
                h="52px"
                borderRadius="xl"
                bg={`${a.color}.100`}
                borderWidth="2px"
                borderColor={`${a.color}.300`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="sm"
              >
                <Icon as={LucideIcon} color={`${a.color}.600`} boxSize={6} aria-hidden />
              </Box>
            </Tooltip>
          );
        })}
      </HStack>
    </Box>
  );
}
