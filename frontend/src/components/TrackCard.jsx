import React from 'react';
import { Box, Text, Button, IconButton, Progress, VStack, HStack, useBreakpointValue } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

function TrackCard({ 
  track, 
  onComplete, 
  onDelete, 
  isLoadingTask, 
  formatTime 
}) {
  const { trackId, title, completedToday, requiredPerDay, remainingTime, daysRemaining, isCompleted } = track;

  const canPerform = remainingTime === 0;
  const completionProgress = (completedToday / requiredPerDay) * 100;

  // Adjust font sizes and layouts based on screen size
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      boxShadow="lg" 
      overflow="hidden" 
      bg="white"
      position="relative"
    >
      {/* Progress bar as the top border */}
      <Progress
        value={completionProgress}
        size="xs"
        colorScheme="purple"
        position="absolute"
        top="0"
        left="0"
        right="0"
        borderTopRadius="md"
      />

      <VStack spacing={3} align="stretch" p={4} pt={6}>
        {/* Title */}
        <Text fontSize="lg" fontWeight="semibold" textAlign="center" noOfLines={2}>
          {title}
        </Text>

        {/* Task Progress */}
        <HStack justifyContent="space-between">
          <Text fontSize={fontSize}>
            Задания: {completedToday}/{requiredPerDay}
          </Text>
          <Text fontSize={fontSize} color="gray.600">
            Осталось дней: {daysRemaining}
          </Text>
        </HStack>


        {/* Action Buttons */}
        <HStack justifyContent="space-between">
          {!isCompleted && (
            <Button
              colorScheme="green"
              size={buttonSize}
              onClick={() => onComplete(trackId)}
              isLoading={isLoadingTask === trackId}
              disabled={!canPerform || isLoadingTask === trackId}
              flex="1"
            >
              {canPerform ? 'Выполнить' : `Ждите ${formatTime(remainingTime)}`}
            </Button>
          )}

          <IconButton
            aria-label="Удалить трек"
            icon={<FaTrash />}
            colorScheme="red"
            size={buttonSize}
            onClick={() => onDelete(trackId)}
          />
        </HStack>
      </VStack>
    </Box>
  );
}

export default TrackCard;
