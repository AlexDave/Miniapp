import React, { useState, useRef } from 'react';
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
  StatHelpText,
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
  ListIcon,
  Icon
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
  Settings,
  Bell,
  Shield,
  Heart,
  Zap,
  Crown,
  Medal,
  Gift,
  Download,
  Share2,
  HelpCircle,
  MessageCircle
} from 'lucide-react';
import useStore from '../store';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

function Profile() {
  const { userProfile, updateUserProfile, addNotification } = useStore();
  const [petName, setPetName] = useState(userProfile.petName);
  const [avatarPreview, setAvatarPreview] = useState(userProfile.avatar);
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Достижения пользователя
  const achievements = [
    { id: 1, name: 'Первые шаги', description: 'Завершите первый курс', icon: Star, earned: true, color: 'yellow' },
    { id: 2, name: 'Неделя обучения', description: 'Занимайтесь 7 дней подряд', icon: Calendar, earned: true, color: 'green' },
    { id: 3, name: 'Мастер команд', description: 'Изучите 10 команд', icon: Target, earned: false, color: 'blue' },
    { id: 4, name: 'Друг питомца', description: 'Проведите 30 дней обучения', icon: Heart, earned: false, color: 'red' },
    { id: 5, name: 'Эксперт', description: 'Завершите все курсы', icon: Crown, earned: false, color: 'purple' },
    { id: 6, name: 'Скорость света', description: 'Завершите курс за 1 день', icon: Zap, earned: false, color: 'orange' }
  ];

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        updateUserProfile({ avatar: reader.result });
        toast({
          title: 'Аватар обновлен',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePetNameChange = (event) => {
    setPetName(event.target.value);
  };

  const savePetName = () => {
    updateUserProfile({ petName });
    setIsEditingName(false);
    toast({
      title: 'Имя питомца обновлено',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleBuyFullPackage = () => {
    onOpen();
  };

  const getLevelProgress = () => {
    const expForNextLevel = userProfile.level * 100;
    const currentExp = userProfile.experience % expForNextLevel;
    return (currentExp / expForNextLevel) * 100;
  };

  const getEarnedAchievementsCount = () => {
    return achievements.filter(achievement => achievement.earned).length;
  };

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
              {/* Avatar Section */}
              <Box position="relative">
                <Avatar
                  size="2xl"
                  src={avatarPreview}
                  name={petName}
                  onClick={() => fileInputRef.current?.click()}
                  cursor="pointer"
                  border="4px solid"
                  borderColor="purple.200"
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
                  aria-label="Change avatar"
                  borderRadius="full"
                />
              </Box>

              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />

              {/* Pet Name Section */}
              <VStack spacing={2}>
                {isEditingName ? (
                  <HStack>
                    <Input
                      value={petName}
                      onChange={handlePetNameChange}
                      placeholder="Введите кличку питомца"
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      maxW="300px"
                      borderColor="purple.200"
                      onBlur={savePetName}
                      onKeyPress={(e) => e.key === 'Enter' && savePetName()}
                      autoFocus
                    />
                    <IconButton
                      icon={<Edit size={16} />}
                      colorScheme="purple"
                      size="sm"
                      onClick={savePetName}
                      aria-label="Save name"
                    />
                  </HStack>
                ) : (
                  <HStack>
                    <Heading size="lg" color="purple.600">{petName}</Heading>
                    <IconButton
                      icon={<Edit size={16} />}
                      colorScheme="purple"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                      aria-label="Edit name"
                    />
                  </HStack>
                )}
                <Text color={textColor}>Уровень {userProfile.level} • {userProfile.experience} XP</Text>
              </VStack>

              {/* Level Progress */}
              <Box width="100%" maxW="400px">
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color={textColor}>Прогресс до следующего уровня</Text>
                  <Text fontSize="sm" color="purple.600" fontWeight="semibold">
                    {Math.round(getLevelProgress())}%
                  </Text>
                </HStack>
                <Progress
                  value={getLevelProgress()}
                  colorScheme="purple"
                  size="lg"
                  borderRadius="full"
                />
              </Box>
            </VStack>
          </CardBody>
        </MotionCard>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={BookOpen} w={6} h={6} color="purple.500" mb={2} />
              <Stat>
                <StatNumber color="purple.600">{userProfile.totalCourses}</StatNumber>
                <StatLabel fontSize="sm">Всего курсов</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={Award} w={6} h={6} color="green.500" mb={2} />
              <Stat>
                <StatNumber color="green.600">{userProfile.completedCourses}</StatNumber>
                <StatLabel fontSize="sm">Завершено</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={Calendar} w={6} h={6} color="blue.500" mb={2} />
              <Stat>
                <StatNumber color="blue.600">{userProfile.streak}</StatNumber>
                <StatLabel fontSize="sm">Дней подряд</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>

          <MotionCard
            whileHover={{ scale: 1.05 }}
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody textAlign="center">
              <Icon as={Trophy} w={6} h={6} color="yellow.500" mb={2} />
              <Stat>
                <StatNumber color="yellow.600">{getEarnedAchievementsCount()}</StatNumber>
                <StatLabel fontSize="sm">Достижений</StatLabel>
              </Stat>
            </CardBody>
          </MotionCard>
        </SimpleGrid>

        {/* Tabs Section */}
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>Достижения</Tab>
            <Tab>Настройки</Tab>
            <Tab>Поддержка</Tab>
          </TabList>

          <TabPanels>
            {/* Achievements Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="purple.600">Ваши достижения</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {achievements.map((achievement) => (
                    <MotionCard
                      key={achievement.id}
                      whileHover={{ scale: 1.02 }}
                      bg={bg}
                      border="1px solid"
                      borderColor={borderColor}
                      opacity={achievement.earned ? 1 : 0.6}
                    >
                      <CardBody>
                        <HStack spacing={4}>
                          <Box
                            p={3}
                            bg={`${achievement.color}.100`}
                            borderRadius="full"
                            color={`${achievement.color}.600`}
                          >
                            <Icon as={achievement.icon} w={6} h={6} />
                          </Box>
                          <VStack align="start" spacing={1} flex="1">
                            <HStack justify="space-between" width="100%">
                              <Text fontWeight="semibold">{achievement.name}</Text>
                              {achievement.earned && (
                                <Badge colorScheme={achievement.color} variant="solid">
                                  Получено
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color={textColor}>
                              {achievement.description}
                            </Text>
                          </VStack>
                        </HStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="purple.600">Настройки</Heading>

                <List spacing={3}>
                  <ListItem>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={Bell} color="purple.500" />
                        <Text>Уведомления</Text>
                      </HStack>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Настроить
                      </Button>
                    </HStack>
                  </ListItem>

                  <ListItem>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={Shield} color="purple.500" />
                        <Text>Приватность</Text>
                      </HStack>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Настроить
                      </Button>
                    </HStack>
                  </ListItem>

                  <ListItem>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={Download} color="purple.500" />
                        <Text>Экспорт данных</Text>
                      </HStack>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Экспорт
                      </Button>
                    </HStack>
                  </ListItem>

                  <ListItem>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={Share2} color="purple.500" />
                        <Text>Поделиться прогрессом</Text>
                      </HStack>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Поделиться
                      </Button>
                    </HStack>
                  </ListItem>
                </List>
              </VStack>
            </TabPanel>

            {/* Support Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Heading size="md" color="purple.600">Поддержка</Heading>

                <List spacing={3}>
                  <ListItem>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={HelpCircle} color="purple.500" />
                        <Text>FAQ</Text>
                      </HStack>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Открыть
                      </Button>
                    </HStack>
                  </ListItem>

                  <ListItem>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={MessageCircle} color="purple.500" />
                        <Text>Связаться с поддержкой</Text>
                      </HStack>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Написать
                      </Button>
                    </HStack>
                  </ListItem>

                  <ListItem>
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={Star} color="purple.500" />
                        <Text>Оценить приложение</Text>
                      </HStack>
                      <Button size="sm" variant="outline" colorScheme="purple">
                        Оценить
                      </Button>
                    </HStack>
                  </ListItem>
                </List>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Premium Package */}
        <MotionCard
          bg="linear-gradient(135deg, purple.500 0%, purple.600 100%)"
          color="white"
        >
          <CardBody>
            <HStack justify="space-between">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={Crown} w={5} h={5} />
                  <Text fontWeight="semibold">Премиум пакет</Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold">
                  Получите доступ ко всем курсам
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Неограниченный доступ к эксклюзивным материалам и персональному тренеру
                </Text>
              </VStack>
              <Button
                colorScheme="whiteAlpha"
                variant="outline"
                onClick={handleBuyFullPackage}
                _hover={{ bg: 'whiteAlpha.200' }}
              >
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
                <ListItem>
                  <HStack>
                    <Icon as={BookOpen} color="purple.500" />
                    <Text>Все курсы обучения</Text>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack>
                    <Icon as={Target} color="purple.500" />
                    <Text>Персональные треки</Text>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack>
                    <Icon as={MessageCircle} color="purple.500" />
                    <Text>Персональный тренер</Text>
                  </HStack>
                </ListItem>
                <ListItem>
                  <HStack>
                    <Icon as={Gift} color="purple.500" />
                    <Text>Эксклюзивные материалы</Text>
                  </HStack>
                </ListItem>
              </List>
              <Text fontSize="lg" fontWeight="bold" textAlign="center" color="purple.600">
                2999 ₽ / месяц
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="purple" onClick={() => {
              toast({
                title: 'Покупка совершена!',
                description: 'Премиум пакет активирован',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
              onClose();
            }}>
              Купить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Profile;
