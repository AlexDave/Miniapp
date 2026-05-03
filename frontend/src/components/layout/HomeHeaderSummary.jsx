import { Box, Flex, HStack, Text, Skeleton, useColorModeValue } from '@chakra-ui/react';
import useStore from '../../store';
import { useProfile } from '../../hooks/useProfile';
import { useUserStats } from '../../hooks/useProgress';

/**
 * Одна строка на главной: имя · серия · косточки (перенесено с Dashboard в header).
 * variant="inline" — только чип без обёртки (строка хедера рядом с логотипом).
 */
export default function HomeHeaderSummary({ variant = 'block' }) {
  const { data: profile, isLoading } = useProfile();
  const { data: userStats } = useUserStats();
  const { userProfile } = useStore();

  const muted = useColorModeValue('gray.300', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.900');
  const border = useColorModeValue('gray.100', 'gray.700');

  const name = userProfile.petName || 'Питомец';
  const streak = userStats?.streak ?? userProfile.streak ?? 0;
  const bones = profile?.totalBones ?? 0;

  const chip = (
    <Box
      px={2.5}
      py={1}
      borderRadius="full"
      borderWidth="1px"
      borderColor={border}
      bg={cardBg}
      w="fit-content"
      maxW={variant === 'inline' ? 'min(52vw, 240px)' : 'min(92vw, 360px)'}
    >
      <HStack spacing={1.5} align="center" justify="center" fontSize="xs" flexWrap="nowrap">
        <Text fontWeight="semibold" color="purple.600" noOfLines={1} maxW="7rem">
          {name}
        </Text>
        <Text as="span" color={muted}>
          |
        </Text>
        <Text as="span" fontWeight="medium" color="orange.600" whiteSpace="nowrap">
          {streak}
          <Text as="span" ml={0.5} aria-hidden>
            🔥
          </Text>
        </Text>
        <Text as="span" color={muted}>
          |
        </Text>
        <HStack spacing={0.5} align="center">
          <Text aria-hidden fontSize="sm" lineHeight={1}>
            🦴
          </Text>
          <Text fontWeight="bold" color="purple.600">
            {bones}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );

  if (isLoading && profile === undefined) {
    if (variant === 'inline') {
      return (
        <Skeleton height="32px" width="min(52vw, 200px)" borderRadius="full" flexShrink={0} />
      );
    }
    return (
      <Flex justify="center" w="100%" pb={2}>
        <Skeleton height="36px" width="min(92vw, 280px)" borderRadius="full" />
      </Flex>
    );
  }

  if (variant === 'inline') {
    return chip;
  }

  return (
    <Flex justify="center" w="100%" pb={2} px={1}>
      {chip}
    </Flex>
  );
}
