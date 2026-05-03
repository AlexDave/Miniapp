import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, VStack, HStack, Text, Button, Badge,
} from '@chakra-ui/react';
import { ArrowRight, Trophy, RefreshCw } from 'lucide-react';
import AnimatedProgressBar from '../motion/AnimatedProgressBar';
import { MOTION, sec } from '../../motion/tokens';
import { transition } from '../../motion/variants';

const SKILL_NAMES = { focus: 'Фокус', sit: 'Сидеть', recall: 'Ко мне' };


export default function XPAnimation({ result, onContinue, onRetry }) {
  const {
    xp_earned,
    total_xp,
    level,
    level_up,
    streak,
    module_complete,
    achievements_unlocked = [],
    feedback_message,
    coins_earned = 0,
    coins_total,
    fallback_tasks = [],
    outcome,
    skills,
    skill_key,
  } = result;

  const oc = outcome ?? (xp_earned > 0 ? 'yes' : 'no');

  const nextLevelXP = level.level < 5 ? [0, 100, 300, 700, 1500][level.level] : null;
  const prevLevelXP = [0, 0, 100, 300, 700][level.level - 1] ?? 0;
  const progressPct = nextLevelXP
    ? Math.min(100, ((total_xp - prevLevelXP) / Math.max(nextLevelXP - prevLevelXP, 1)) * 100)
    : 100;

  const skillLabel = skill_key ? SKILL_NAMES[skill_key] ?? skill_key : null;
  const skillPct =
    skill_key && skills && typeof skills[skill_key] === 'number'
      ? Math.round(skills[skill_key])
      : null;

  const heroEmoji = oc === 'yes' ? '🎉' : oc === 'partial' ? '👍' : '💡';
  const heroTitle =
    oc === 'yes' ? 'Отлично!' : oc === 'partial' ? 'Неплохо' : 'Попробуем проще';

  const xpDelaySec = level_up ? 0.35 : 0.05;
  const barDelaySec = xp_earned > 0 ? 0.55 : 0.15;
  const streakDelaySec = barDelaySec + 0.35;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: sec(MOTION.duration.normal), ease: MOTION.easing.default }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          background: level_up ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.55)',
        }}
      >
        <motion.div
          initial={{ scale: 0.82, opacity: 0, y: 36 }}
          animate={
            oc === 'no'
              ? {
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  x: [0, -5, 5, -3, 0],
                  transition: {
                    scale: transition.springSoft,
                    x: { duration: 0.45, ease: MOTION.easing.default },
                  },
                }
              : {
                  scale: 1,
                  opacity: 1,
                  y: 0,
                  transition: transition.springSoft,
                }
          }
          style={{ width: '100%', maxWidth: 360 }}
        >
          <VStack
            bg="white"
            _dark={{ bg: 'gray.800' }}
            borderRadius="2xl"
            p={6}
            spacing={4}
            shadow="2xl"
            overflow="hidden"
            position="relative"
          >
            {level_up ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.25, 1] }}
                transition={{ duration: sec(MOTION.duration.levelUp / 2), ease: MOTION.easing.bounce }}
                style={{ textAlign: 'center' }}
              >
                <Trophy size={56} color="#F6AD55" />
                <Text fontSize="2xl" fontWeight="bold" textAlign="center" mt={2}>
                  Уровень {level.level}!
                </Text>
                <Badge colorScheme="orange" fontSize="lg" px={4} py={1} borderRadius="full">
                  {level.name}
                </Badge>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
                transition={{ duration: 0.45, ease: MOTION.easing.bounce }}
                style={{ fontSize: '3rem', textAlign: 'center' }}
              >
                {heroEmoji}
              </motion.div>
            )}

            {!level_up && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: sec(MOTION.duration.normal), ease: MOTION.easing.default }}
              >
                <Text fontSize="xl" fontWeight="bold" textAlign="center">
                  {heroTitle}
                </Text>
              </motion.div>
            )}

            <VStack spacing={3} w="100%" position="relative" pt={xp_earned > 0 && oc !== 'no' ? 8 : 0}>
                {xp_earned > 0 && oc !== 'no' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: [10, 2, -18, -26],
                    }}
                    transition={{
                      delay: xpDelaySec,
                      duration: sec(MOTION.duration.xpFloat),
                      times: [0, 0.1, 0.78, 1],
                      ease: MOTION.easing.default,
                    }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      pointerEvents: 'none',
                      fontWeight: 800,
                      fontSize: '1.75rem',
                      color: 'var(--chakra-colors-green-500)',
                    }}
                  >
                    +{xp_earned} XP
                  </motion.div>
                )}

                {feedback_message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: sec(MOTION.duration.normal), ease: MOTION.easing.default }}
                  >
                    <Text fontSize="sm" textAlign="center" color="gray.700" _dark={{ color: 'gray.200' }}>
                      {feedback_message}
                    </Text>
                  </motion.div>
                )}

                {skillPct != null && skillLabel && oc !== 'no' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: barDelaySec + 0.05, ...transition.out }}
                  >
                    <Text fontSize="sm" color="purple.600" fontWeight="medium" textAlign="center">
                      Навык «{skillLabel}» — {skillPct}%
                    </Text>
                  </motion.div>
                )}

                <Box w="100%">
                  <motion.div
                    initial={{ opacity: oc === 'no' ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: oc === 'no' ? 0 : barDelaySec - 0.05, duration: 0.25 }}
                  >
                    <HStack justify="center" mb={2}>
                      <Text fontSize="3xl" fontWeight="bold" color={oc === 'no' ? 'gray.400' : 'green.500'}>
                        +{xp_earned}
                      </Text>
                      <Text fontSize="lg" color={oc === 'no' ? 'gray.400' : 'green.600'}>
                        XP
                      </Text>
                    </HStack>
                  </motion.div>

                  {coins_earned > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: barDelaySec }}>
                      <HStack bg="yellow.50" borderRadius="lg" px={4} py={2} w="100%" justify="center">
                        <Text fontSize="sm" fontWeight="medium">
                          🪙 +{coins_earned} монет
                          {typeof coins_total === 'number' && ` · всего ${coins_total}`}
                        </Text>
                      </HStack>
                    </motion.div>
                  )}

                  {fallback_tasks.length > 0 && (
                    <Box w="100%" bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="lg" p={3} mt={2}>
                      <Text fontSize="xs" color="gray.600" _dark={{ color: 'gray.300' }} mb={2}>
                        Проще так:
                      </Text>
                      <VStack align="stretch" spacing={1}>
                        {fallback_tasks.map((t, i) => (
                          <Text key={i} fontSize="sm">
                            • {t}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  <HStack justify="space-between" mb={1} mt={3}>
                    <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>{level.name}</Text>
                    <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>{total_xp} XP</Text>
                  </HStack>
                  <AnimatedProgressBar
                    value={progressPct}
                    from={0}
                    delay={barDelaySec}
                    duration={MOTION.duration.slow}
                    barColor="green.400"
                  />
                </Box>

                {streak > 0 && oc === 'yes' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }}
                    transition={{ delay: streakDelaySec, duration: 0.5, ease: MOTION.easing.default }}
                  >
                    <HStack bg="orange.50" borderRadius="lg" px={4} py={2} w="100%">
                      <Text fontSize="lg">🔥</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} подряд
                      </Text>
                    </HStack>
                  </motion.div>
                )}

                {module_complete && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: streakDelaySec + 0.1 }}>
                    <HStack bg="purple.50" borderRadius="lg" px={4} py={2} w="100%">
                      <Text>🎓</Text>
                      <Text fontSize="sm" fontWeight="medium">Модуль завершён!</Text>
                    </HStack>
                  </motion.div>
                )}

                {achievements_unlocked.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.15, 1], opacity: 1 }}
                    transition={{
                      delay: streakDelaySec + 0.15 + i * 0.12,
                      duration: sec(0.55),
                      ease: MOTION.easing.bounce,
                    }}
                    style={{
                      boxShadow: '0 0 24px rgba(246, 224, 94, 0.45)',
                      borderRadius: '12px',
                      width: '100%',
                    }}
                  >
                    <HStack bg="yellow.50" borderRadius="lg" px={4} py={2} w="100%">
                      <Text>🏆</Text>
                      <Text fontSize="sm" fontWeight="medium">{a.name}</Text>
                    </HStack>
                  </motion.div>
                ))}
              </VStack>

            {oc === 'partial' && onRetry ? (
              <motion.div style={{ width: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <HStack w="100%" spacing={3}>
                  <Button flex={1} variant="outline" leftIcon={<RefreshCw size={16} />} onClick={onRetry}>
                    Повторить
                  </Button>
                  <Button flex={1} colorScheme="green" rightIcon={<ArrowRight size={18} />} onClick={onContinue}>
                    Дальше
                  </Button>
                </HStack>
              </motion.div>
            ) : oc === 'no' && onRetry ? (
              <motion.div style={{ width: '100%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <VStack w="100%" spacing={2}>
                  <Button w="100%" colorScheme="orange" size="lg" onClick={onRetry}>
                    Попробовать снова
                  </Button>
                  <Button w="100%" variant="ghost" onClick={onContinue}>
                    На главную
                  </Button>
                </VStack>
              </motion.div>
            ) : (
              <motion.div style={{ width: '100%' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <Button colorScheme="green" rightIcon={<ArrowRight size={18} />} w="100%" size="lg" onClick={onContinue}>
                  Продолжить
                </Button>
              </motion.div>
            )}
          </VStack>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
