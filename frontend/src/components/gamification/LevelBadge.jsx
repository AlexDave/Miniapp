import { Badge } from '@chakra-ui/react';

const STAGE_COLORS = {
  'Знакомство': 'gray',
  'Базовые навыки': 'blue',
  'Уверенный': 'purple',
  'Самостоятельный': 'orange',
  'Партнёр': 'yellow',
};

// Оставляем компонент рабочим для обратной совместимости,
// но теперь он показывает стадию, а не уровень
export default function LevelBadge({ level, levelName, stage, size = 'sm' }) {
  const displayStage = stage ?? levelName ?? `Уровень ${level}`;
  const color = STAGE_COLORS[displayStage] ?? 'purple';
  return (
    <Badge
      colorScheme={color}
      px={2}
      py={0.5}
      borderRadius="full"
      fontSize={size === 'sm' ? 'xs' : 'sm'}
    >
      {displayStage}
    </Badge>
  );
}
