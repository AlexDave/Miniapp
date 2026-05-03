import { useState } from 'react';
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Button,
  VStack,
  Text,
  Textarea,
  SimpleGrid,
  FormControl,
  FormLabel,
  Select,
  useToast,
} from '@chakra-ui/react';
import { useLogBehaviorIncident } from '../../hooks/useBehavior';

const TYPES = [
  { id: 'barking', title: 'Лай / вой', emoji: '🔊' },
  { id: 'accident', title: 'Туалет', emoji: '🚿' },
  { id: 'escape', title: 'Побег / срыв', emoji: '🏃' },
  { id: 'aggression', title: 'Агрессия / напор', emoji: '⚡' },
  { id: 'chewing', title: 'Грызёт / кусает', emoji: '🦴' },
  { id: 'other', title: 'Другое', emoji: '📝' },
];

export default function BehaviorIncidentDrawer({ isOpen, onClose }) {
  const toast = useToast();
  const logMut = useLogBehaviorIncident();
  const [note, setNote] = useState('');
  const [severity, setSeverity] = useState('2');

  function reset() {
    setNote('');
    setSeverity('2');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function submit(type) {
    try {
      const res = await logMut.mutateAsync({
        type,
        note: note.trim() || undefined,
        severity: parseInt(severity, 10) || 2,
      });
      const extra =
        res.suggested_skill_key && res.suggested_skill_title
          ? ` Раздел «Навыки» → «${res.suggested_skill_title}».`
          : '';
      toast({
        title: 'Записали',
        description: `${res.suggestion_message || 'Инцидент сохранён в журнале.'}${extra}`,
        status: 'success',
        duration: 7000,
        isClosable: true,
      });
      handleClose();
    } catch {
      toast({ title: 'Не удалось сохранить', status: 'error', duration: 3000 });
    }
  }

  return (
    <Drawer isOpen={isOpen} placement="bottom" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent borderTopRadius="2xl" maxH="88vh">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" fontSize="md">
          Отметить инцидент
        </DrawerHeader>
        <DrawerBody pb={8}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Выберите тип — запись поможет подсказать подходящий атом в навыках.
            </Text>
            <SimpleGrid columns={2} spacing={2}>
              {TYPES.map((t) => (
                <Button
                  key={t.id}
                  variant="outline"
                  h="auto"
                  py={3}
                  px={2}
                  whiteSpace="normal"
                  textAlign="center"
                  onClick={() => submit(t.id)}
                  isLoading={logMut.isLoading}
                  borderRadius="xl"
                >
                  <Text fontSize="lg" mb={1}>{t.emoji}</Text>
                  <Text fontSize="xs" fontWeight="medium">{t.title}</Text>
                </Button>
              ))}
            </SimpleGrid>
            <FormControl>
              <FormLabel fontSize="sm">Заметка (необязательно)</FormLabel>
              <Textarea
                size="sm"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Контекст: где, что триггерило…"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Сила эпизода (1–5)</FormLabel>
              <Select size="sm" value={severity} onChange={(e) => setSeverity(e.target.value)} maxW="120px">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Select>
            </FormControl>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
