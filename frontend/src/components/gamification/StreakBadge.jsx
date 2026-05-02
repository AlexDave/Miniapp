import { HStack, Text, Box } from '@chakra-ui/react';

export default function StreakBadge({ streak, size = 'sm' }) {
  if (!streak || streak < 1) return null;

  const isHot = streak >= 7;

  return (
    <Box
      bg={isHot ? 'orange.50' : 'gray.50'}
      border="1px solid"
      borderColor={isHot ? 'orange.200' : 'gray.200'}
      borderRadius="full"
      px={3}
      py={1}
    >
      <HStack spacing={1}>
        <Text fontSize={size === 'sm' ? 'sm' : 'md'}>🔥</Text>
        <Text
          fontSize={size === 'sm' ? 'xs' : 'sm'}
          fontWeight="semibold"
          color={isHot ? 'orange.600' : 'gray.600'}
        >
          {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'}
        </Text>
      </HStack>
    </Box>
  );
}
