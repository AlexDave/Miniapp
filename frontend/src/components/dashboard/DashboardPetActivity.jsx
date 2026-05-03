import React from 'react';
import { Box, Text, VStack, HStack, Skeleton, Badge } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { usePetActivity } from '../../hooks/usePetFamily';

const MotionBox = motion(Box);

function formatActivityWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffMs = now - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн. назад`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function successLabel(success) {
  if (success === 'no') return 'без успеха';
  if (success === 'yes' || success == null) return '';
  return '';
}

export default function DashboardPetActivity() {
  const { data, isLoading, isError } = usePetActivity(10);
  const items = data?.items ?? [];

  if (isError) return null;

  return (
    <MotionBox initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Box
        borderWidth="1px"
        borderRadius="2xl"
        borderColor="blackAlpha.100"
        _dark={{ borderColor: 'whiteAlpha.200' }}
        p={4}
      >
        <Text fontSize="sm" fontWeight="semibold" mb={3} color="purple.600">
          Недавние уроки питомца
        </Text>
        {isLoading ? (
          <VStack spacing={2} align="stretch">
            {[1, 2, 3].map((k) => (
              <Skeleton key={k} height="40px" borderRadius="md" />
            ))}
          </VStack>
        ) : items.length === 0 ? (
          <Text fontSize="xs" color="mutedFg">
            Пока нет завершённых уроков — начните с практики дня.
          </Text>
        ) : (
          <VStack spacing={2} align="stretch">
            {items.map((row) => {
              const extra = successLabel(row.success);
              return (
                <HStack
                  key={row.id}
                  justify="space-between"
                  align="start"
                  py={1.5}
                  px={2}
                  borderRadius="lg"
                  _hover={{ bg: 'blackAlpha.50', _dark: { bg: 'whiteAlpha.50' } }}
                >
                  <Box minW={0} flex="1">
                    <Text fontSize="sm" noOfLines={2}>
                      <Text as="span" fontWeight="medium">
                        {row.user_name}
                      </Text>
                      {' — '}
                      <Text as="span" color="mutedFg">
                        {row.lesson_title}
                      </Text>
                    </Text>
                    {extra ? (
                      <Badge mt={1} size="sm" colorScheme="orange" variant="subtle">
                        {extra}
                      </Badge>
                    ) : null}
                  </Box>
                  <Text fontSize="xs" color="mutedFg" whiteSpace="nowrap" flexShrink={0} pl={2}>
                    {formatActivityWhen(row.completed_at)}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        )}
      </Box>
    </MotionBox>
  );
}
