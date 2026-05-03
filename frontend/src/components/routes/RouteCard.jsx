import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Button,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { CheckCircle, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import RouteProgressMap from './RouteProgressMap';

const MotionBox = motion(Box);

export default function RouteCard({ route, isSelected, onSelect, isSelecting }) {
  const [expanded, setExpanded] = useState(false);
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.600');
  const selectedBorder = 'purple.400';
  const muted = useColorModeValue('gray.600', 'gray.400');
  const skillBg = useColorModeValue('gray.50', 'gray.700');
  const skillDoneColor = useColorModeValue('green.600', 'green.300');
  const skillBoneColor = useColorModeValue('green.600', 'green.400');
  const skillRowHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');

  const ageLabel = () => {
    if (route.age_min_months == null && route.age_max_months == null) return null;
    if (route.age_max_months == null) return `от ${route.age_min_months} мес.`;
    if (route.age_min_months === 0) return `до ${route.age_max_months} мес.`;
    return `${route.age_min_months}–${route.age_max_months} мес.`;
  };

  return (
    <MotionBox
      bg={bg}
      border="2px solid"
      borderColor={isSelected ? selectedBorder : border}
      borderRadius="2xl"
      overflow="hidden"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.18 }}
    >
      <Box p={4}>
        <HStack justify="space-between" mb={2}>
          <HStack spacing={3}>
            <Text fontSize="2xl" aria-hidden>{route.icon ?? '🐾'}</Text>
            <Box>
              <HStack spacing={2}>
                <Text fontWeight="bold" fontSize="md" _dark={{ color: 'gray.100' }}>
                  {route.title}
                </Text>
                {isSelected && (
                  <Badge colorScheme="purple" variant="solid" fontSize="xs">
                    <HStack spacing={1}><CheckCircle size={10} /><span>Мой</span></HStack>
                  </Badge>
                )}
              </HStack>
              {ageLabel() && <Text fontSize="xs" color={muted}>{ageLabel()}</Text>}
              {isSelected && (
                <Box mt={1}>
                  <RouteProgressMap route={route} variant="inline" />
                </Box>
              )}
            </Box>
          </HStack>
          <MotionBox
            as="button"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded((v) => !v)}
            color={muted}
            aria-label="Раскрыть маршрут"
          >
            <ChevronDown size={18} />
          </MotionBox>
        </HStack>

        <Text fontSize="sm" color={muted} mb={3}>{route.description}</Text>

        <HStack justify="space-between" mb={1}>
          <Text fontSize="xs" color={muted}>Прогресс</Text>
          <Text fontSize="xs" color={muted}>{route.progress_pct ?? 0}%</Text>
        </HStack>
        <Progress
          value={route.progress_pct ?? 0}
          colorScheme={isSelected ? 'purple' : 'gray'}
          size="xs"
          borderRadius="full"
          mb={3}
        />

        <Button
          colorScheme={isSelected ? 'purple' : 'gray'}
          variant={isSelected ? 'solid' : 'outline'}
          size="sm"
          w="full"
          borderRadius="lg"
          isLoading={isSelecting}
          onClick={onSelect}
          leftIcon={isSelected ? <CheckCircle size={14} /> : <MapPin size={14} />}
        >
          {isSelected ? 'Активный маршрут' : 'Выбрать маршрут'}
        </Button>
      </Box>

      <AnimatePresence initial={false}>
        {expanded && (
          <MotionBox
            key="skills"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            overflow="hidden"
          >
            <Divider borderColor={border} />
            <Box p={4} bg={skillBg}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={muted} mb={2}>
                Навыки маршрута
              </Text>
              <VStack align="stretch" spacing={0.5}>
                {(route.skills ?? []).map((rs, i) => {
                  const label = rs.skill_title ?? rs.skill_key;
                  return (
                    <Box
                      key={rs.skill_key}
                      as={RouterLink}
                      to={`/skills?skill=${encodeURIComponent(rs.skill_key)}`}
                      aria-label={`Открыть навык «${label}» в каталоге`}
                      display="block"
                      borderRadius="md"
                      py={1.5}
                      px={2}
                      mx={-2}
                      outline="none"
                      _hover={{ bg: skillRowHover }}
                      _focusVisible={{ boxShadow: 'outline' }}
                      transition="background 0.15s"
                    >
                      <HStack spacing={2} justify="space-between" align="center">
                        <HStack spacing={2} flex={1} minW={0}>
                          <Text fontSize="xs" color={muted} w="16px" textAlign="right" flexShrink={0}>
                            {i + 1}.
                          </Text>
                          <Text
                            fontSize="xs"
                            color={rs.bones_earned > 0 ? skillDoneColor : muted}
                            noOfLines={1}
                          >
                            {label}
                          </Text>
                        </HStack>
                        <HStack spacing={1} flexShrink={0}>
                          {rs.bones_earned > 0 && (
                            <Text fontSize="xs" color={skillBoneColor}>{rs.bones_earned} 🦴</Text>
                          )}
                          <Box as="span" color={muted} display="flex" alignItems="center" aria-hidden>
                            <ChevronRight size={14} strokeWidth={2.5} />
                          </Box>
                        </HStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </MotionBox>
  );
}
