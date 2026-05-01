import { Badge, HStack, Text } from '@chakra-ui/react';

const LEVEL_COLORS = ['', 'gray', 'blue', 'purple', 'orange', 'yellow'];

export default function LevelBadge({ level, levelName, size = 'sm' }) {
  return (
    <Badge
      colorScheme={LEVEL_COLORS[level] ?? 'gray'}
      px={2}
      py={0.5}
      borderRadius="full"
      fontSize={size === 'sm' ? 'xs' : 'sm'}
    >
      <HStack spacing={1}>
        <Text>Ур. {level}</Text>
        {levelName && <Text>· {levelName}</Text>}
      </HStack>
    </Badge>
  );
}
