import { Box, Text, VStack, HStack, Progress, Badge } from '@chakra-ui/react';
import { useSkillMap } from '../../hooks/useProgress';

const CATEGORY_ICONS = {
  'Базовые навыки': '🐾',
  'Поведение на прогулке': '🦮',
  'Поведение': '🤝',
  'Спорт': '🏆',
  'Коррекция': '🛠️',
};

function ScoreDots({ score }) {
  const filled = Math.round(score);
  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          w="8px"
          h="8px"
          borderRadius="full"
          bg={i <= filled ? 'green.400' : 'gray.200'}
        />
      ))}
    </HStack>
  );
}

export default function SkillMap() {
  const { data, isLoading } = useSkillMap();

  if (isLoading) {
    return <Box h="200px" bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="lg" />;
  }

  const skills = data?.skills ?? [];

  if (skills.length === 0) {
    return (
      <Box p={4} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="lg" textAlign="center">
        <Text fontSize="sm" color="gray.500">Начни первый урок чтобы увидеть карту навыков</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      <Text fontSize="sm" fontWeight="semibold">Карта навыков</Text>
      {skills.map((skill) => {
        const icon = CATEGORY_ICONS[skill.category] ?? '📚';
        const progress = skill.lessons_total > 0
          ? (skill.lessons_done / skill.lessons_total) * 100
          : 0;

        return (
          <Box
            key={skill.id}
            p={3}
            bg="white"
            _dark={{ bg: 'gray.800', borderColor: 'gray.600' }}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
          >
            <HStack justify="space-between" mb={2}>
              <HStack>
                <Text fontSize="lg">{icon}</Text>
                <Text fontSize="sm" fontWeight="medium">{skill.name}</Text>
              </HStack>
              <HStack>
                {skill.is_completed && (
                  <Badge colorScheme="green" fontSize="xs">Завершён</Badge>
                )}
                <ScoreDots score={skill.score} />
              </HStack>
            </HStack>
            <Progress
              value={progress}
              colorScheme={skill.is_completed ? 'green' : 'blue'}
              size="xs"
              borderRadius="full"
            />
            <Text fontSize="xs" color="gray.400" mt={1}>
              {skill.lessons_done} из {skill.lessons_total} уроков
            </Text>
          </Box>
        );
      })}
    </VStack>
  );
}
