import { Box, Text, HStack, Progress, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useUserStats } from '../../hooks/useProgress';

const LABELS = { focus: 'Фокус', sit: 'Сидеть', recall: 'Ко мне' };

export default function HomeSkillsPreview() {
  const { data: stats } = useUserStats();
  const skills = stats?.skills ?? {};
  const muted = useColorModeValue('gray.600', 'gray.400');

  const rows = ['focus', 'recall', 'sit'].map((k) => ({
    key: k,
    label: LABELS[k],
    value: Math.round(skills[k] ?? 0),
  }));

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" fontWeight="semibold">
          Навыки
        </Text>
        <Text as={RouterLink} to="/skills" fontSize="xs" color="purple.500">
          Все →
        </Text>
      </HStack>
      <Box
        p={3}
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="xl"
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        {rows.map(({ key, label, value }) => (
          <Box key={key} mb={key !== 'sit' ? 3 : 0}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color={muted}>
                {label}
              </Text>
              <Text fontSize="xs" fontWeight="medium">
                {value}%
              </Text>
            </HStack>
            <Progress value={value} size="xs" colorScheme="purple" borderRadius="full" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
