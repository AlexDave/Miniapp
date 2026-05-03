import { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  Text,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import PressableButton from '../motion/PressableButton';
import { MOTION, sec } from '../../motion/tokens';

/**
 * Один чекбокс-шаг на экран: фокус + «Сделал» + микро-награда перед следующим.
 */
export default function TaskStepFlow({ task, onComplete }) {
  const steps = (task?.steps ?? []).filter((s) => s.type === 'checkbox');
  const total = steps.length;

  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(false);

  const muted = useColorModeValue('gray.600', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('purple.100', 'gray.600');
  /** Плотная заливка, чтобы текст задания не просвечивал и «Отлично» читался на фоне */
  const fillAccent = useColorModeValue('purple.200', 'purple.800');
  /** Тёмная тема: светло-зелёный на фиолетовом «плавает» — белый + лёгкая тень читаются стабильнее */
  const burstLabelColor = useColorModeValue('green.700', 'white');
  const burstLabelShadow = useColorModeValue('none', '0 2px 10px rgba(0,0,0,0.45)');

  const finish = useCallback(() => {
    const rows = steps.map((s) => ({ step_id: s.id, value: true }));
    onComplete(rows);
  }, [steps, onComplete]);

  const onDone = () => {
    setBurst(true);
    window.setTimeout(() => {
      setBurst(false);
      if (index + 1 >= total) {
        finish();
      } else {
        setIndex((i) => i + 1);
      }
    }, 420);
  };

  if (total === 0) {
    return null;
  }

  const step = steps[index];
  const progressPct = ((index + 1) / total) * 100;

  return (
    <VStack spacing={6} align="stretch" minH="50vh" justify="center">
      <Box>
        <Text fontSize="xs" fontWeight="semibold" color={muted} letterSpacing="wide">
          Шаг {index + 1} / {total}
        </Text>
        <Progress value={progressPct} colorScheme="purple" size="xs" borderRadius="full" mt={2} />
      </Box>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -22 }}
          transition={{ duration: sec(MOTION.duration.normal), ease: MOTION.easing.default }}
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
            {/* Текст шага убираем из потока при burst — иначе накладывается на заливку и «Отлично» */}
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

            <AnimatePresence>
              {burst && (
                <>
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
                </>
              )}
            </AnimatePresence>
          </Box>
        </motion.div>
      </AnimatePresence>

      <PressableButton
        colorScheme="purple"
        size="lg"
        fullWidth
        h="14"
        fontSize="lg"
        borderRadius="xl"
        successTap
        isDisabled={burst}
        onClick={onDone}
      >
        Сделал
      </PressableButton>
    </VStack>
  );
}
