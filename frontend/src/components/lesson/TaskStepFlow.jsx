import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import PressableButton from '../motion/PressableButton';
import ReducedMotionAnimatePresence from '../../motion/ReducedMotionAnimatePresence';
import { MOTION, sec } from '../../motion/tokens';

function vibrateShort(quietMode) {
  if (quietMode || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(60);
  } catch {
    /* ignore */
  }
}

/**
 * Пошаговое задание: только кнопка «Готово» между чекбокс-шагами; без таймера и свайпа.
 */
export default function TaskStepFlow({ task, onComplete, onGiveUp, quietMode = false }) {
  const reduceMotion = useReducedMotion();
  const steps = useMemo(
    () => (task?.steps ?? []).filter((s) => s.type === 'checkbox'),
    [task?.steps]
  );
  const total = steps.length;

  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(false);

  const burstTimerRef = useRef(null);
  const burstingRef = useRef(false);

  const muted = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('purple.100', 'gray.600');
  const fillAccent = useColorModeValue('purple.200', 'purple.800');
  const burstLabelColor = useColorModeValue('green.700', 'white');
  const burstLabelShadow = useColorModeValue('none', '0 2px 10px rgba(0,0,0,0.45)');

  const finish = useCallback(() => {
    const rows = steps.map((s) => ({ step_id: s.id, value: true }));
    onComplete(rows);
  }, [steps, onComplete]);

  const partialRowsUpTo = useCallback(
    (lastDoneIndex) => {
      return steps.map((s, i) => ({ step_id: s.id, value: i <= lastDoneIndex }));
    },
    [steps]
  );

  const runBurstThenAdvance = useCallback(() => {
    if (burstingRef.current) return;
    burstingRef.current = true;
    setBurst(true);
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstTimerRef.current = window.setTimeout(() => {
      burstingRef.current = false;
      setBurst(false);
      vibrateShort(quietMode);
      if (index + 1 >= total) {
        finish();
      } else {
        setIndex((i) => i + 1);
      }
    }, 420);
  }, [index, total, finish, quietMode]);

  useEffect(() => {
    burstingRef.current = false;
    setBurst(false);
  }, [index]);

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    };
  }, []);

  const handleGiveUp = useCallback(() => {
    if (!onGiveUp || burstingRef.current || burst) return;
    if (burstTimerRef.current) window.clearTimeout(burstTimerRef.current);
    burstingRef.current = false;
    setBurst(false);
    onGiveUp(partialRowsUpTo(index - 1));
  }, [onGiveUp, burst, partialRowsUpTo, index]);

  if (total === 0) {
    return null;
  }

  const step = steps[index];
  const progressPct = ((index + 1) / total) * 100;

  return (
    <VStack spacing={5} align="stretch" minH="50vh" justify="center">
      <Box>
        <Text fontSize="xs" fontWeight="semibold" color={muted} letterSpacing="wide">
          Шаг {index + 1} / {total}
        </Text>
        <Progress value={progressPct} colorScheme="purple" size="xs" borderRadius="full" mt={2} />
      </Box>

      <ReducedMotionAnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: reduceMotion ? 0 : 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : -22 }}
          transition={{
            duration: reduceMotion ? 0 : sec(MOTION.duration.normal),
            ease: MOTION.easing.default,
          }}
          style={{ width: '100%' }}
        >
          <Box
            position="relative"
            overflow="hidden"
            p={8}
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={cardBorder}
            textAlign="center"
            minH="200px"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Box
              position="relative"
              zIndex={0}
              aria-hidden={burst}
              opacity={burst ? 0 : 1}
              visibility={burst ? 'hidden' : 'visible'}
              transition={burst ? 'none' : 'opacity 0.2s ease'}
            >
              <Text fontSize="2xl" fontWeight="bold" lineHeight="short" px={2}>
                {step.label}
              </Text>
            </Box>

            <ReducedMotionAnimatePresence>
              {burst && (
                <>
                  {reduceMotion ? (
                    <Box
                      position="absolute"
                      inset={0}
                      bg={fillAccent}
                      zIndex={1}
                      borderRadius="inherit"
                    />
                  ) : (
                    <motion.div
                      key="fill"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: sec(MOTION.duration.normal),
                        ease: MOTION.easing.default,
                      }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 0,
                        transformOrigin: 'bottom center',
                        backgroundColor: fillAccent,
                        zIndex: 1,
                        borderRadius: 'inherit',
                      }}
                    />
                  )}
                  {reduceMotion ? (
                    <Box
                      position="absolute"
                      inset={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={2}
                      pointerEvents="none"
                    >
                      <Text
                        fontSize="2xl"
                        fontWeight="extrabold"
                        color={burstLabelColor}
                        letterSpacing="tight"
                        sx={{ textShadow: burstLabelShadow }}
                      >
                        Отлично
                      </Text>
                    </Box>
                  ) : (
                    <motion.div
                      key="ok"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        delay: sec(MOTION.duration.normal) * 0.35,
                        duration: sec(MOTION.duration.fast),
                        ease: MOTION.easing.out,
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        pointerEvents: 'none',
                      }}
                    >
                      <Text
                        fontSize="2xl"
                        fontWeight="extrabold"
                        color={burstLabelColor}
                        letterSpacing="tight"
                        sx={{ textShadow: burstLabelShadow }}
                      >
                        Отлично
                      </Text>
                    </motion.div>
                  )}
                </>
              )}
            </ReducedMotionAnimatePresence>
          </Box>
        </motion.div>
      </ReducedMotionAnimatePresence>

      <HStack spacing={3} align="stretch">
        {onGiveUp && (
          <Button
            variant="outline"
            colorScheme="gray"
            size="lg"
            flex={1}
            borderRadius="xl"
            isDisabled={burst}
            onClick={handleGiveUp}
          >
            Не получилось
          </Button>
        )}
        <Box flex={onGiveUp ? 2 : 1} minW={0}>
          <PressableButton
            colorScheme="purple"
            size="lg"
            fullWidth
            h="16"
            fontSize="xl"
            borderRadius="xl"
            successTap
            isDisabled={burst}
            onClick={runBurstThenAdvance}
          >
            Готово
          </PressableButton>
        </Box>
      </HStack>
    </VStack>
  );
}
