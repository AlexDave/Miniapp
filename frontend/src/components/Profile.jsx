import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Avatar,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  IconButton,
  Card,
  CardBody,
  Progress,
  Badge,
  SimpleGrid,
  Divider,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  Icon,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import {
  Edit,
  Camera,
  Trophy,
  Award,
  Star,
  Calendar,
  Target,
  BookOpen,
  Shield,
  Heart,
  Zap,
  Crown,
  Download,
  Share2,
  HelpCircle,
  MessageCircle,
  Gift,
  Map,
  BarChart2,
  GraduationCap,
  Users,
  UserPlus,
  Link2,
} from 'lucide-react';
import useStore from '../store';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useTrophyVideos } from '../hooks/useLessons';
import { apiClient } from '../hooks/useApi';
import { useAchievements } from '../hooks/useAchievements';
import { useUserStats } from '../hooks/useProgress';
import { useSkillTree } from '../hooks/useSkillTree';
import { useRoutes } from '../hooks/useRoutes';
import { usePetMine, usePetInvite, usePetJoin } from '../hooks/usePetFamily';
import { featurePayments } from '../config/features';
import SkillMap from './progress/SkillMap';
import ActivityHeatmap from './progress/ActivityHeatmap';
import StreakBadge from './gamification/StreakBadge';
import TrophyShelf from './profile/TrophyShelf';
import TrophyVideoShelf from './profile/TrophyVideoShelf';
import BehaviorTimeline from './behavior/BehaviorTimeline';
import DashboardPetActivity from './dashboard/DashboardPetActivity';

const MotionCard = motion(Card);

const REMINDER_TZ_OPTIONS = [
  { value: 'Europe/Moscow', label: 'Москва' },
  { value: 'Europe/Kaliningrad', label: 'Калининград' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург' },
  { value: 'Asia/Novosibirsk', label: 'Новосибирск' },
  { value: 'Europe/Kiev', label: 'Киев' },
  { value: 'Europe/Tallinn', label: 'Таллин' },
  { value: 'UTC', label: 'UTC' },
];

const ICON_COMPONENTS = {
  Star,
  Calendar,
  Target,
  Heart,
  Crown,
  Zap,
  Trophy,
  Award,
  BarChart: BarChart2,
  GraduationCap,
  BookOpen,
};

function Profile() {
  const { userProfile } = useStore();
  const queryClient = useQueryClient();
  const { isLoading: profileLoading } = useProfile();
  const { data: trophyVideos = [] } = useTrophyVideos();
  const updateProfile = useUpdateProfile();
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements();
  const { data: stats } = useUserStats();
  const { data: skillTree } = useSkillTree();
  const { data: routesData } = useRoutes();
  const { data: petFamily, isLoading: petFamilyLoading } = usePetMine();
  const petInvite = usePetInvite();
  const petJoin = usePetJoin();

  const topAtoms = useMemo(() => {
    if (!Array.isArray(skillTree)) return [];
    const flat = [];
    for (const cat of skillTree) {
      for (const s of cat.skills ?? []) {
        flat.push({
          key: s.key,
          title: s.title,
          pct: typeof s.progress_pct === 'number' ? s.progress_pct : 0,
        });
      }
    }
    return [...flat].sort((a, b) => b.pct - a.pct).slice(0, 3);
  }, [skillTree]);

  const selectedRouteTitle = useMemo(() => {
    const routes = routesData?.routes ?? [];
    return routes.find((r) => r.is_selected)?.title ?? null;
  }, [routesData]);

  const [petName, setPetName] = useState('');
  const [joinTokenInput, setJoinTokenInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bindReminderBot = useMutation(async () => {
    const { data } = await apiClient.get('/api/user/profile/reminder-bind-link');
    return data.url;
  });

  const starsInvoiceMutation = useMutation(async () => {
    const { data } = await apiClient.post('/api/payments/stars-invoice', { plan: 'pro_month' });
    return data;
  });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Синхронизируем локальный стейт с данными из стора (заполненного через useProfile)
  useEffect(() => {
    setPetName(userProfile.petName);
  }, [userProfile.petName]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile.mutate({ avatar: reader.result });
      toast({ title: 'Аватар обновлён', status: 'success', duration: 2000, isClosable: true });
    };
    reader.readAsDataURL(file);
  };

  const savePetName = async () => {
    if (!petName.trim() || petName === userProfile.petName) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateProfile.mutateAsync({ petName: petName.trim() });
      toast({ title: 'Имя питомца обновлено', status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: 'Ошибка при сохранении', status: 'error', duration: 2000, isClosable: true });
    }
    setIsEditingName(false);
  };

  const streak = stats?.streak ?? userProfile.streak;
  const bonesStage = userProfile.stage ?? 'Знакомство';

  const earnedCount = achievements.filter((a) => a.earned).length;
  const isPetOwner = petFamily?.my_role === 'owner';
  const petMembers = petFamily?.members ?? [];

  const handlePetInvite = async () => {
    const pid = petFamily?.pet?.id;
    if (!pid) return;
    try {
      const res = await petInvite.mutateAsync(pid);
      const text = res.url || res.token;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast({
          title: 'Ссылка в буфере',
          description: 'Отправьте её второму хозяину в Telegram.',
          status: 'success',
          duration: 3500,
          isClosable: true,
        });
      } else {
        toast({ title: 'Приглашение', description: text, status: 'info', duration: 8000, isClosable: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Не удалось создать приглашение';
      toast({ title: msg, status: 'error', duration: 4000, isClosable: true });
    }
  };

  const handlePetJoin = async () => {
    const t = joinTokenInput.trim();
    if (!t) {
      toast({ title: 'Вставьте токен из ссылки', status: 'warning', duration: 2500 });
      return;
    }
    try {
      await petJoin.mutateAsync(t.replace(/^pet_/, ''));
      setJoinTokenInput('');
      toast({ title: 'Готово', description: 'Вы в одной семье с питомцем.', status: 'success', duration: 4000 });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Не удалось присоединиться';
      toast({ title: msg, status: 'error', duration: 5000, isClosable: true });
    }
  };

  if (profileLoading) {
    return (
      <Flex justify="center" align="center" height="60vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box pb={20}>
      <VStack spacing={6} align="stretch">
        {/* Profile Header */}
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          bg={bg}
          border="1px solid"
          borderColor={borderColor}
        >
          <CardBody>
            <VStack spacing={6} align="center">
              {/* Avatar */}
              <Box position="relative">
                <Avatar
                  size="2xl"
                  src={userProfile.avatar}
                  name={userProfile.petName}
                  cursor="pointer"
                  border="4px solid"
                  borderColor="purple.200"
                  onClick={() => fileInputRef.current?.click()}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                />
                <IconButton
                  position="absolute"
                  bottom={0}
                  right={0}
                  size="sm"
                  colorScheme="purple"
                  icon={<Camera size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Сменить аватар"
                  borderRadius="full"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  ref={fileInputRef}
                  display="none"
                />
              </Box>

              {/* Pet Name */}
              <VStack spacing={2}>
                {isEditingName ? (
                  <HStack>
                    <Input
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="Кличка питомца"
                      maxW="300px"
                      borderColor="purple.200"
                      autoFocus
                      onBlur={savePetName}
                      onKeyDown={(e) => e.key === 'Enter' && savePetName()}
                    />
                    <IconButton
                      icon={<Edit size={16} />}
                      colorScheme="purple"
                      size="sm"
                      onClick={savePetName}
                      isLoading={updateProfile.isLoading}
                      aria-label="Сохранить"
                    />
                  </HStack>
                ) : (
                  <HStack>
                    <Heading size="lg" color="purple.600">{userProfile.petName}</Heading>
                    <IconButton
                      icon={<Edit size={16} />}
                      colorScheme="purple"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                      aria-label="Редактировать"
                    />
                  </HStack>
                )}
                <HStack spacing={2} flexWrap="wrap" justify="center">
                  <Badge colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="sm">
                    {bonesStage}
                  </Badge>
                  {streak > 0 && <StreakBadge streak={streak} />}
                </HStack>
              </VStack>

              <Box width="100%" maxW="440px" alignSelf="stretch">
                <TrophyShelf achievements={achievements} />
              </Box>

              <Box width="100%" maxW="440px" alignSelf="stretch">
                <TrophyVideoShelf videos={trophyVideos} />
              </Box>

              {topAtoms.length > 0 && (
                <Box width="100%" maxW="400px">
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                    Сильнейшие атомы
                  </Text>
                  {selectedRouteTitle && (
                    <Text fontSize="xs" color={textColor} mb={2}>
                      Маршрут:{' '}
                      <Text as="span" fontWeight="semibold" color="purple.600">
                        {selectedRouteTitle}
                      </Text>
                    </Text>
                  )}
                  <VStack spacing={2} align="stretch">
                    {topAtoms.map(({ key, title, pct }) => (
                      <Box key={key}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" color={textColor} noOfLines={1}>
                            {title}
                          </Text>
                          <Text fontSize="xs">{Math.round(pct)}%</Text>
                        </HStack>
                        <Progress
                          value={pct}
                          size="xs"
                          colorScheme="purple"
                          borderRadius="full"
                        />
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          bg={bg}
          border="1px solid"
          borderColor={borderColor}
        >
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={2}>
                <Icon as={Users} color="purple.500" boxSize={5} />
                <Heading size="md" color="purple.600">
                  Хозяева «{userProfile.petName}»
                </Heading>
              </HStack>
              {petFamilyLoading ? (
                <Spinner size="sm" color="purple.500" />
              ) : petMembers.length === 0 ? (
                <Text fontSize="sm" color={textColor}>
                  Список участников загрузится после сохранения профиля.
                </Text>
              ) : (
                <List spacing={2}>
                  {petMembers.map((m) => (
                    <ListItem key={m.user_id}>
                      <HStack justify="space-between" flexWrap="wrap" gap={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          {m.name}
                        </Text>
                        <Badge colorScheme={m.role === 'owner' ? 'purple' : 'gray'} borderRadius="full">
                          {m.role === 'owner' ? 'владелец' : 'участник'}
                        </Badge>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              )}
              {isPetOwner && (
                <Button
                  size="sm"
                  colorScheme="purple"
                  variant="outline"
                  leftIcon={<UserPlus size={16} />}
                  isLoading={petInvite.isLoading}
                  onClick={handlePetInvite}
                >
                  Пригласить по ссылке
                </Button>
              )}
              {isPetOwner && (
                <Text fontSize="xs" color={textColor}>
                  Ссылка одноразовая, действует 7 дней. Второй аккаунт без своей истории уроков сможет
                  присоединиться.
                </Text>
              )}
            </VStack>
          </CardBody>
        </MotionCard>

        <DashboardPetActivity />

        <HStack spacing={3} flexWrap="wrap" justify="center">
          <Button
            as={RouterLink}
            to="/profile/marshrut"
            size="md"
            variant="outline"
            colorScheme="purple"
            leftIcon={<Map size={18} />}
          >
            Сменить маршрут
          </Button>
        </HStack>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {[
            { icon: BookOpen, color: 'purple', value: stats?.reports_count ?? 0, label: 'Уроков' },
            { icon: Award, color: 'green', value: stats?.modules_done ?? 0, label: 'Модулей' },
            { icon: Calendar, color: 'blue', value: streak, label: 'Дней подряд' },
            { icon: Trophy, color: 'yellow', value: earnedCount, label: 'Достижений' },
          ].map(({ icon: IconComp, color, value, label }) => (
            <MotionCard key={label} whileHover={{ scale: 1.05 }} bg={bg} border="1px solid" borderColor={borderColor}>
              <CardBody textAlign="center">
                <Icon as={IconComp} w={6} h={6} color={`${color}.500`} mb={2} />
                <Stat>
                  <StatNumber color={`${color}.600`}>{value}</StatNumber>
                  <StatLabel fontSize="sm">{label}</StatLabel>
                </Stat>
              </CardBody>
            </MotionCard>
          ))}
        </SimpleGrid>

        {/* Tabs */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>Прогресс</Tab>
            <Tab>Достижения</Tab>
            <Tab>Настройки</Tab>
            <Tab>Поддержка</Tab>
          </TabList>

          <TabPanels>
            {/* Прогресс */}
            <TabPanel>
              <VStack spacing={5} align="stretch">
                <Card bg={bg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <ActivityHeatmap />
                  </CardBody>
                </Card>
                <Card bg={bg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <SkillMap />
                  </CardBody>
                </Card>
                <Card bg={bg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <Heading size="sm" mb={3} color="purple.600" _dark={{ color: 'purple.300' }}>
                      Журнал поведения
                    </Heading>
                    <BehaviorTimeline />
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Achievements */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md" color="purple.600">Достижения</Heading>
                  {!achievementsLoading && (
                    <Text fontSize="sm" color={textColor}>{earnedCount} / {achievements.length}</Text>
                  )}
                </HStack>

                {achievementsLoading ? (
                  <Flex justify="center" py={6}><Spinner color="purple.500" /></Flex>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {achievements.map((achievement) => {
                      const IconComp = ICON_COMPONENTS[achievement.icon] || Trophy;
                      return (
                        <MotionCard
                          key={achievement.id}
                          whileHover={{ scale: 1.02 }}
                          bg={bg}
                          border="1px solid"
                          borderColor={achievement.earned ? `${achievement.color}.200` : borderColor}
                          opacity={achievement.earned ? 1 : 0.55}
                        >
                          <CardBody>
                            <HStack spacing={4}>
                              <Box
                                p={3}
                                bg={`${achievement.color}.100`}
                                borderRadius="full"
                                color={`${achievement.color}.600`}
                              >
                                <Icon as={IconComp} w={6} h={6} />
                              </Box>
                              <VStack align="start" spacing={1} flex="1">
                                <HStack justify="space-between" width="100%">
                                  <Text fontWeight="semibold">{achievement.name}</Text>
                                  {achievement.earned && (
                                    <Badge colorScheme={achievement.color} variant="solid">Получено</Badge>
                                  )}
                                </HStack>
                                <Text fontSize="sm" color={textColor}>{achievement.description}</Text>
                              </VStack>
                            </HStack>
                          </CardBody>
                        </MotionCard>
                      );
                    })}
                  </SimpleGrid>
                )}
              </VStack>
            </TabPanel>

            {/* Settings */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="purple.600">Настройки</Heading>
                <FormControl display="flex" alignItems="center" justifyContent="space-between" gap={4}>
                  <FormLabel htmlFor="lesson-quiet" mb={0} fontSize="sm" flex={1}>
                    Тихий режим урока (без озвучки и вибрации)
                  </FormLabel>
                  <Switch
                    id="lesson-quiet"
                    colorScheme="purple"
                    isChecked={userProfile.lessonQuietMode === true}
                    isDisabled={updateProfile.isLoading}
                    onChange={(e) => {
                      updateProfile.mutate({
                        preferences: { lesson_quiet_mode: e.target.checked },
                      });
                    }}
                  />
                </FormControl>

                <Divider />

                <Heading size="sm" color="gray.700">Напоминания в Telegram</Heading>
                <Text fontSize="xs" color={textColor}>
                  В выбранное время бот пришлёт сообщение, если сегодня ещё не было тренировки. Не чаще одного раза в день.
                </Text>
                <FormControl display="flex" alignItems="center" justifyContent="space-between" gap={4}>
                  <FormLabel htmlFor="reminders-on" mb={0} fontSize="sm" flex={1}>
                    Включить напоминания
                  </FormLabel>
                  <Switch
                    id="reminders-on"
                    colorScheme="purple"
                    isChecked={userProfile.remindersEnabled === true}
                    isDisabled={updateProfile.isLoading}
                    onChange={(e) => {
                      updateProfile.mutate({ remindersEnabled: e.target.checked });
                    }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Время (в вашем часовом поясе)</FormLabel>
                  <Input
                    type="time"
                    size="sm"
                    maxW="200px"
                    value={userProfile.reminderTime ?? '19:00'}
                    isDisabled={updateProfile.isLoading}
                    onChange={(e) => updateProfile.mutate({ reminderTime: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Часовой пояс</FormLabel>
                  <Select
                    size="sm"
                    value={userProfile.reminderTz ?? 'Europe/Moscow'}
                    isDisabled={updateProfile.isLoading}
                    onChange={(e) => updateProfile.mutate({ reminderTz: e.target.value })}
                  >
                    {REMINDER_TZ_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl display="flex" alignItems="center" justifyContent="space-between" gap={4}>
                  <FormLabel htmlFor="rem-quiet-wk" mb={0} fontSize="sm" flex={1}>
                    Не беспокоить в выходные
                  </FormLabel>
                  <Switch
                    id="rem-quiet-wk"
                    colorScheme="purple"
                    isChecked={userProfile.reminderQuietWeekends === true}
                    isDisabled={updateProfile.isLoading}
                    onChange={(e) => {
                      updateProfile.mutate({ reminderQuietWeekends: e.target.checked });
                    }}
                  />
                </FormControl>
                <HStack spacing={3} flexWrap="wrap" align="center">
                  <Button
                    size="sm"
                    colorScheme="purple"
                    variant="outline"
                    isLoading={bindReminderBot.isLoading}
                    onClick={async () => {
                      try {
                        const url = await bindReminderBot.mutateAsync();
                        const tw = window.Telegram?.WebApp;
                        if (tw?.openTelegramLink) tw.openTelegramLink(url);
                        else window.open(url, '_blank', 'noopener,noreferrer');
                      } catch {
                        toast({ title: 'Ссылка недоступна', description: 'Проверьте TELEGRAM_BOT_USERNAME на сервере.', status: 'error', duration: 4000 });
                      }
                    }}
                  >
                    Подключить бота
                  </Button>
                  {userProfile.reminderBotLinked && (
                    <Badge colorScheme="green" fontSize="xs">бот подключён</Badge>
                  )}
                </HStack>

                <Divider />

                <Heading size="sm" color="gray.700">
                  Семья питомца
                </Heading>
                <Text fontSize="xs" color={textColor}>
                  Если вам прислали ссылку или токен из Telegram (<code>/start pet_…</code>), вставьте
                  только часть после <code>pet_</code>.
                </Text>
                <HStack spacing={2} flexWrap="wrap" align="flex-end">
                  <FormControl maxW="280px" flex="1">
                    <FormLabel fontSize="sm">Токен приглашения</FormLabel>
                    <Input
                      size="sm"
                      placeholder="hex из ссылки"
                      value={joinTokenInput}
                      onChange={(e) => setJoinTokenInput(e.target.value)}
                      autoComplete="off"
                    />
                  </FormControl>
                  <Button
                    size="sm"
                    colorScheme="purple"
                    leftIcon={<Link2 size={14} />}
                    isLoading={petJoin.isLoading}
                    onClick={handlePetJoin}
                  >
                    Присоединиться
                  </Button>
                </HStack>

                <Divider />

                <Text fontSize="xs" color={textColor}>
                  Экспорт данных и расширенная приватность — позже.
                </Text>
                <List spacing={3}>
                  {[
                    { icon: Shield, label: 'Приватность' },
                    { icon: Download, label: 'Экспорт данных' },
                    { icon: Share2, label: 'Поделиться прогрессом' },
                  ].map(({ icon: IconComp, label }) => (
                    <ListItem key={label}>
                      <HStack>
                        <Icon as={IconComp} color="purple.500" />
                        <Text fontSize="sm">{label}</Text>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </VStack>
            </TabPanel>

            {/* Support */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="purple.600">Поддержка</Heading>
                <List spacing={2}>
                  {[
                    { icon: HelpCircle, label: 'FAQ' },
                    { icon: MessageCircle, label: 'Написать в поддержку' },
                    { icon: Star, label: 'Оценить приложение' },
                  ].map(({ icon: IconComp, label }) => (
                    <ListItem key={label}>
                      <Button
                        variant="ghost"
                        size="sm"
                        justifyContent="flex-start"
                        leftIcon={<IconComp size={18} />}
                        onClick={() =>
                          toast({ title: label, description: 'Раздел скоро будет доступен.', status: 'info', duration: 2500 })
                        }
                      >
                        {label}
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {featurePayments && (
          <>
            {userProfile?.isPro ? (
              <MotionCard bg="green.600" color="white">
                <CardBody>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={Crown} w={5} h={5} />
                        <Text fontWeight="semibold">Pro активен</Text>
                      </HStack>
                      <Text fontSize="sm" opacity={0.95}>
                        {userProfile.tierExpiresAt
                          ? `Подписка до ${new Date(userProfile.tierExpiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} (после окончания — ещё несколько дней grace-доступа к премиум-маршрутам).`
                          : 'Полный доступ к премиум-маршрутам.'}
                      </Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </MotionCard>
            ) : (
              <MotionCard bg="purple.500" color="white">
                <CardBody>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Icon as={Crown} w={5} h={5} />
                        <Text fontWeight="semibold">DogCourse Pro</Text>
                      </HStack>
                      <Text fontSize="lg" fontWeight="bold">Премиум-маршруты</Text>
                      <Text fontSize="sm" opacity={0.9}>
                        Оплата через Telegram Stars — откроются маршруты «Городская собака», «Спокойный дома» и дальше.
                      </Text>
                    </VStack>
                    <Button colorScheme="whiteAlpha" variant="outline" onClick={onOpen} _hover={{ bg: 'whiteAlpha.200' }}>
                      Купить
                    </Button>
                  </HStack>
                </CardBody>
              </MotionCard>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>DogCourse Pro (Telegram Stars)</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack spacing={4} align="stretch">
                    <Text>Получите доступ к:</Text>
                    <List spacing={2}>
                      {[
                        [BookOpen, 'Вся библиотека'],
                        [Map, 'Премиум-маршруты в разделе «Маршруты»'],
                        [MessageCircle, 'Персональный тренер (скоро)'],
                        [Gift, 'Эксклюзивные материалы (скоро)'],
                      ].map(([IconComp, label]) => (
                        <ListItem key={label}>
                          <HStack>
                            <Icon as={IconComp} color="purple.500" />
                            <Text>{label}</Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Сумма списывается в Stars после подтверждения в Telegram. Откройте мини-приложение внутри Telegram.
                    </Text>
                  </VStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onClose}>Отмена</Button>
                  <Button
                    colorScheme="purple"
                    isLoading={starsInvoiceMutation.isLoading}
                    onClick={() => {
                      starsInvoiceMutation.mutate(undefined, {
                        onSuccess: (data) => {
                          const tw = window.Telegram?.WebApp;
                          if (!data?.invoice_url) {
                            toast({ title: 'Нет ссылки на оплату', status: 'error' });
                            return;
                          }
                          if (typeof tw?.openInvoice !== 'function') {
                            toast({
                              title: 'Откройте в Telegram',
                              description: 'Оплата Stars доступна только в мини-приложении Telegram.',
                              status: 'warning',
                            });
                            return;
                          }
                          tw.openInvoice(data.invoice_url, (status) => {
                            if (status === 'paid') {
                              queryClient.invalidateQueries(['profile']);
                              queryClient.invalidateQueries(['routes']);
                              toast({ title: 'Спасибо! Pro активирован.', status: 'success', duration: 4000, isClosable: true });
                              onClose();
                            } else if (status === 'cancelled') {
                              toast({ title: 'Оплата отменена', status: 'info' });
                            } else {
                              toast({ title: 'Оплата', description: String(status), status: 'info' });
                            }
                          });
                        },
                        onError: (err) => {
                          toast({
                            title: 'Не удалось создать счёт',
                            description: err?.response?.data?.error || err.message,
                            status: 'error',
                          });
                        },
                      });
                    }}
                  >
                    Оплатить Stars
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default Profile;
