import { Box, Text, HStack, VStack, Tooltip } from '@chakra-ui/react';
import { useActivity } from '../../hooks/useProgress';

const WEEKS = 13; // 13 недель = ~90 дней

function getIntensity(day) {
  const n = day.lessons_count ?? 0;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (n === 2) return 2;
  return 3;
}

const LIGHT_COLORS = ['gray.100', 'green.100', 'green.300', 'green.700'];
const DARK_COLORS = ['gray.700', 'green.900', 'green.600', 'green.400'];

function DayCell({ day }) {
  const intensity = getIntensity(day);

  return (
    <Tooltip
      label={`${day.date}: ${day.lessons_count ?? 0} ${(day.lessons_count ?? 0) === 1 ? 'урок' : 'уроков'}`}
      hasArrow
      fontSize="xs"
    >
      <Box
        w="12px"
        h="12px"
        bg={LIGHT_COLORS[intensity]}
        _dark={{ bg: DARK_COLORS[intensity] }}
        borderRadius="2px"
        cursor="default"
        _hover={{ transform: 'scale(1.3)', transition: 'transform 0.1s' }}
      />
    </Tooltip>
  );
}

export default function ActivityHeatmap() {
  const { data, isLoading } = useActivity();

  if (isLoading) {
    return <Box h="80px" bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="lg" />;
  }

  const days = data?.days ?? [];

  // Разбиваем на недели
  const weeks = [];
  for (let i = 0; i < WEEKS; i++) {
    weeks.push(days.slice(i * 7, i * 7 + 7));
  }

  const totalLessons = days.reduce((sum, d) => sum + (d.lessons_count ?? 0), 0);
  const activeDays = days.filter((d) => (d.lessons_count ?? 0) > 0).length;

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" fontWeight="semibold">Активность за 3 месяца</Text>
        <Text fontSize="xs" color="mutedFg">{activeDays} дн · {totalLessons} уроков</Text>
      </HStack>

      <Box overflowX="auto" pb={1}>
        <HStack spacing={1} align="flex-start">
          {weeks.map((week, wi) => (
            <VStack key={wi} spacing={1}>
              {week.map((day, di) => (
                <DayCell key={`${wi}-${di}`} day={day} />
              ))}
            </VStack>
          ))}
        </HStack>
      </Box>

      <HStack spacing={2} mt={2} justify="flex-end">
        <Text fontSize="xs" color="gray.400">Меньше</Text>
        {LIGHT_COLORS.map((c, i) => (
          <Box key={i} w="10px" h="10px" bg={c} _dark={{ bg: DARK_COLORS[i] }} borderRadius="2px" />
        ))}
        <Text fontSize="xs" color="gray.400">Больше</Text>
      </HStack>
    </Box>
  );
}
