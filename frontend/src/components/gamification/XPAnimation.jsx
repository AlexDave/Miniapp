import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, VStack, HStack, Text, Button, Badge, Progress,
} from '@chakra-ui/react';
import { Star, ArrowRight, Trophy } from 'lucide-react';

export default function XPAnimation({ result, onContinue }) {
  const {
    xp_earned,
    total_xp,
    level,
    level_up,
    streak,
    module_complete,
    achievements_unlocked = [],
  } = result;

  const nextLevelXP = level.level < 5
    ? [0, 100, 300, 700, 1500][level.level]
    : null;
  const prevLevelXP = [0, 0, 100, 300, 700][level.level - 1] ?? 0;
  const progress = nextLevelXP
    ? ((total_xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100
    : 100;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(0,0,0,0.7)"
      zIndex={100}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ width: '100%', maxWidth: 360 }}
      >
        <VStack
          bg="white"
          borderRadius="2xl"
          p={6}
          spacing={4}
          shadow="2xl"
        >
          {level_up ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Trophy size={56} color="#F6AD55" />
              </motion.div>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                Новый уровень!
              </Text>
              <Badge colorScheme="orange" fontSize="lg" px={4} py={1} borderRadius="full">
                {level.name}
              </Badge>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Star size={48} color="#F6AD55" fill="#F6AD55" />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ width: '100%' }}
          >
            <VStack spacing={3} w="100%">
              <HStack
                bg="green.50"
                borderRadius="xl"
                px={5}
                py={3}
                w="100%"
                justify="center"
              >
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  +{xp_earned}
                </Text>
                <Text fontSize="lg" color="green.600">XP</Text>
              </HStack>

              <Box w="100%">
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" color="gray.500">{level.name}</Text>
                  <Text fontSize="xs" color="gray.500">{total_xp} XP</Text>
                </HStack>
                <Progress
                  value={Math.min(progress, 100)}
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              {streak > 0 && (
                <HStack bg="orange.50" borderRadius="lg" px={4} py={2} w="100%">
                  <Text>🔥</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд
                  </Text>
                </HStack>
              )}

              {module_complete && (
                <HStack bg="purple.50" borderRadius="lg" px={4} py={2} w="100%">
                  <Text>🎓</Text>
                  <Text fontSize="sm" fontWeight="medium">Модуль завершён! +50 XP</Text>
                </HStack>
              )}

              {achievements_unlocked.map((a) => (
                <HStack key={a.id} bg="yellow.50" borderRadius="lg" px={4} py={2} w="100%">
                  <Text>🏆</Text>
                  <Text fontSize="sm" fontWeight="medium">{a.name}</Text>
                </HStack>
              ))}
            </VStack>
          </motion.div>

          <Button
            colorScheme="green"
            rightIcon={<ArrowRight size={18} />}
            w="100%"
            size="lg"
            onClick={onContinue}
          >
            Продолжить
          </Button>
        </VStack>
      </motion.div>
    </Box>
  );
}
