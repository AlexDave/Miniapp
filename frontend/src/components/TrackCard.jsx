import React, { useState, useRef } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  IconButton, 
  Progress, 
  VStack, 
  HStack, 
  useBreakpointValue, 
  Tooltip, 
  useOutsideClick 
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

function TrackCard({ 
  track, 
  onComplete, 
  onDelete, 
  isLoadingTask, 
  formatTime 
}) {
  const { trackId, title, completedToday, requiredPerDay, remainingTime, daysRemaining, isCompleted } = track;

  const [showTooltip, setShowTooltip] = useState(false); // Управление тултипом
  const progressBarRef = useRef(); // Ссылка на контейнер прогресс-бара

  const canPerform = remainingTime === 0;
  const completionProgress = (completedToday / requiredPerDay) * 100;

  const progressText = completionProgress >= 100 
    ? "Завершено" 
    : `Прогресс: ${Math.round(completionProgress)}%`;

  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  // Закрытие тултипа при клике за пределами прогресс-бара
  useOutsideClick({
    ref: progressBarRef,
    handler: () => setShowTooltip(false),
  });

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      boxShadow="lg" 
      overflow="hidden" 
      bg="white"
      position="relative"
    >
      {/* Прогресс-бар с текстом */}
      <Box 
        position="relative" 
        ref={progressBarRef} 
        onClick={() => setShowTooltip((prev) => !prev)} // Тултип переключается по клику
      >
        <Tooltip 
          isOpen={showTooltip} 
          label={`Завершено: ${Math.round(completionProgress)}%. Осталось дней: ${daysRemaining}`} 
          hasArrow 
          placement={useBreakpointValue({ base: "bottom", md: "top" })}
        >
          <Progress
            value={completionProgress}
            size="lg"
            colorScheme="purple"
            height="30px"
            borderTopRadius="md"
          />
        </Tooltip>
        <Text 
          position="absolute" 
          top="50%" 
          left="50%" 
          transform="translate(-50%, -50%)" 
          fontSize="xs" 
          fontWeight="bold" 
          color={completionProgress >= 50 ? 'white' : 'purple.700'}
        >
          {progressText}
        </Text>
      </Box>

      <VStack spacing={3} align="stretch" p={4} pt={6}>
        {/* Заголовок */}
        <Text fontSize="lg" fontWeight="semibold" textAlign="left" noOfLines={2}>
          {title}
        </Text>


        {/* Кнопки действий */}
        <HStack justifyContent="space-between" align="center">
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
