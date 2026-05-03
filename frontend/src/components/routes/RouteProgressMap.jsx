import { Text, HStack, Box, useColorModeValue } from '@chakra-ui/react';

export function countRequiredSkillProgress(route) {
  const skills = route?.skills ?? [];
  const required = skills.filter((s) => s.is_required);
  const done = required.filter((s) => (s.bones_earned ?? 0) > 0).length;
  return { done, total: required.length };
}

/**
 * Компактный индикатор «N из M» по обязательным навыкам с хотя бы одной косточкой.
 */
export default function RouteProgressMap({ route, variant = 'block' }) {
  const { done, total } = countRequiredSkillProgress(route);
  const muted = useColorModeValue('gray.600', 'gray.400');
  const strong = useColorModeValue('gray.800', 'gray.100');

  if (total === 0) return null;

  const label = `${done} из ${total} обязательных навыков`;

  if (variant === 'inline') {
    return (
      <Text fontSize="xs" color={muted}>
        {label}
      </Text>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" spacing={2}>
        <Text fontSize="xs" color={muted} fontWeight="medium">
          Шаги маршрута
        </Text>
        <Text fontSize="xs" color={strong} fontWeight="semibold">
          {label}
        </Text>
      </HStack>
    </Box>
  );
}
