import React, { useState, useRef, useEffect } from 'react';
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
import {
  Edit,
  Camera,
  Trophy,
  Award,
  Star,
  Calendar,
  Target,
  BookOpen,
  Bell,
  Shield,
  Heart,
  Zap,
  Crown,
  Download,
  Share2,
  HelpCircle,
  MessageCircle,
  Gift,
} from 'lucide-react';
import useStore from '../store';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useAchievements } from '../hooks/useAchievements';
import { useUserStats } from '../hooks/useProgress';
import SkillMap from './progress/SkillMap';
import ActivityHeatmap from './progress/ActivityHeatmap';
import StreakBadge from './gamification/StreakBadge';
import BoneCounter from './gamification/BoneCounter';

const MotionCard = motion(Card);

const ICON_COMPONENTS = { Star, Calendar, Target, Heart, Crown, Zap, Trophy, Award };

function Profile() {
  const { userProfile } = useStore();
  const { isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements();
  const { data: stats } = useUserStats();

  const [petName, setPetName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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
  const totalBones = userProfile.totalBones ?? 0;
  const bonesStage = userProfile.stage ?? 'Знакомство';
  const bonesBySkill = userProfile.bones ?? {};

  const earnedCount = achievements.filter((a) => a.earned).length;

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

              {/* Копилка косточек */}
              <Box width="100%" maxW="400px">
                <BoneCounter total={totalBones} bySkill={bonesBySkill} stage={bonesStage} />
              </Box>

              {stats?.skills && (
                <Box width="100%" maxW="400px">
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                    Навыки
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {[
                      ['focus', 'Фокус'],
                      ['sit', 'Сидеть'],
                      ['recall', 'Ко мне'],
                    ].map(([key, ru]) => (
                      <Box key={key}>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" color={textColor}>{ru}</Text>
                          <Text fontSize="xs">{Math.round(stats.skills[key] ?? 0)}%</Text>
                        </HStack>
                        <Progress
                          value={stats.skills[key] ?? 0}
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
                <List spacing={3}>
                  {[
                    { icon: Bell, label: 'Уведомления' },
                    { icon: Shield, label: 'Приватность' },
                    { icon: Download, label: 'Экспорт данных' },
                    { icon: Share2, label: 'Поделиться прогрессом' },
                  ].map(({ icon: IconComp, label }) => (
                    <ListItem key={label}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={IconComp} color="purple.500" />
                          <Text>{label}</Text>
                        </HStack>
                        <Button size="sm" variant="outline" colorScheme="purple">
                          Настроить
                        </Button>
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
                <List spacing={3}>
                  {[
                    { icon: HelpCircle, label: 'FAQ' },
                    { icon: MessageCircle, label: 'Написать в поддержку' },
                    { icon: Star, label: 'Оценить приложение' },
                  ].map(({ icon: IconComp, label }) => (
                    <ListItem key={label}>
                      <HStack justify="space-between">
                        <HStack>
                          <Icon as={IconComp} color="purple.500" />
                          <Text>{label}</Text>
                        </HStack>
                        <Button size="sm" variant="outline" colorScheme="purple">Открыть</Button>
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Premium Banner */}
        <MotionCard bg="purple.500" color="white">
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={Crown} w={5} h={5} />
                  <Text fontWeight="semibold">Премиум пакет</Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold">Доступ ко всем курсам</Text>
                <Text fontSize="sm" opacity={0.9}>
                  Неограниченный доступ к материалам и персональному тренеру
                </Text>
              </VStack>
              <Button colorScheme="whiteAlpha" variant="outline" onClick={onOpen} _hover={{ bg: 'whiteAlpha.200' }}>
                Купить
              </Button>
            </HStack>
          </CardBody>
        </MotionCard>
      </VStack>

      {/* Purchase Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Премиум пакет</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>Получите доступ к:</Text>
              <List spacing={2}>
                {[
                  [BookOpen, 'Все курсы обучения'],
                  [Target, 'Персональные треки'],
                  [MessageCircle, 'Персональный тренер'],
                  [Gift, 'Эксклюзивные материалы'],
                ].map(([IconComp, label]) => (
                  <ListItem key={label}>
                    <HStack>
                      <Icon as={IconComp} color="purple.500" />
                      <Text>{label}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
              <Text fontSize="lg" fontWeight="bold" textAlign="center" color="purple.600">
                2 999 ₽ / месяц
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Отмена</Button>
            <Button
              colorScheme="purple"
              onClick={() => {
                toast({ title: 'Покупка совершена!', description: 'Премиум пакет активирован', status: 'success', duration: 3000, isClosable: true });
                onClose();
              }}
            >
              Купить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Profile;
