import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  useColorModeValue,
  Card,
  CardBody,
  IconButton,
  Icon,
  Divider,
  Badge,
  Flex,
  Heading,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { motion, useReducedMotion } from 'framer-motion';
import ReducedMotionAnimatePresence from '../motion/ReducedMotionAnimatePresence';
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Search,
  User,
  Bot,
  Clock,
  MessageCircle
} from 'lucide-react';
import useStore from '../store';

const MotionBox = motion(Box);

function Chat() {
  const { chatMessages, chatContacts, addChatMessage, setChatMessages, setChatContacts } = useStore();
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();
  const reduceMotion = useReducedMotion();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const messageBg = useColorModeValue('purple.50', 'purple.900');
  const otherMessageBg = useColorModeValue('gray.100', 'gray.700');

  // Инициализация контактов и сообщений
  useEffect(() => {
    const initialContacts = [
      {
        id: 1,
        name: 'Анна Петрова',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        status: 'online',
        lastMessage: 'Привет! Как дела с обучением?',
        lastMessageTime: '14:30',
        unreadCount: 2
      },
      {
        id: 2,
        name: 'Михаил Кинолог',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        status: 'online',
        lastMessage: 'Отличная работа с командой "сидеть"!',
        lastMessageTime: '12:15',
        unreadCount: 0
      },
      {
        id: 3,
        name: 'Елена Дрессировщик',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        status: 'offline',
        lastMessage: 'Завтра продолжим тренировки',
        lastMessageTime: 'Вчера',
        unreadCount: 1
      }
    ];

    const initialMessages = [
      {
        id: 1,
        text: 'Привет! Как у тебя дела с обучением питомца?',
        sender: 'other',
        contactId: 1,
        timestamp: new Date(Date.now() - 3600000),
        type: 'text'
      },
      {
        id: 2,
        text: 'Привет! Всё отлично, спасибо! Мы начали курс "Основы послушания"',
        sender: 'me',
        contactId: 1,
        timestamp: new Date(Date.now() - 3500000),
        type: 'text'
      },
      {
        id: 3,
        text: 'Отлично! Какой прогресс?',
        sender: 'other',
        contactId: 1,
        timestamp: new Date(Date.now() - 3400000),
        type: 'text'
      },
      {
        id: 4,
        text: 'Уже освоили команду "сидеть"! 🎉',
        sender: 'me',
        contactId: 1,
        timestamp: new Date(Date.now() - 3300000),
        type: 'text'
      }
    ];

    setChatContacts(initialContacts);
    setChatMessages(initialMessages);
    setSelectedContact(initialContacts[0]);
  }, [setChatContacts, setChatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !selectedContact) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      contactId: selectedContact.id,
      timestamp: new Date(),
      type: 'text'
    };

    addChatMessage(message);
    setNewMessage('');
    setIsTyping(true);

    // Имитация ответа
    setTimeout(() => {
      const responses = [
        'Отлично! Продолжайте в том же духе! 🐕',
        'Это замечательный прогресс! 👍',
        'Молодец! Ваш питомец быстро учится',
        'Попробуйте добавить больше повторений',
        'Не забудьте про положительное подкрепление! 🦴'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const replyMessage = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'other',
        contactId: selectedContact.id,
        timestamp: new Date(),
        type: 'text'
      };

      addChatMessage(replyMessage);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentContactMessages = () => {
    return chatMessages.filter(msg => msg.contactId === selectedContact?.id);
  };

  const markAsRead = (contactId) => {
    // Здесь можно добавить логику для отметки сообщений как прочитанных
    toast({
      title: 'Сообщения отмечены как прочитанные',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box pb={20} height="100vh" display="flex">
      {/* Contacts Sidebar */}
      <Box
        width={{ base: '100%', md: '300px' }}
        bg={bg}
        borderRight="1px solid"
        borderColor={borderColor}
        display={{ base: selectedContact ? 'none' : 'block', md: 'block' }}
      >
        <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
          <Heading size="md" color="purple.600" mb={4}>Сообщения</Heading>
          <InputGroup>
            <Input
              placeholder="Поиск контактов..."
              bg={useColorModeValue('gray.50', 'gray.700')}
            />
            <InputRightElement>
              <Icon as={Search} color="gray.400" />
            </InputRightElement>
          </InputGroup>
        </Box>

        <VStack spacing={0} align="stretch" overflow="auto" maxH="calc(100vh - 140px)">
          {chatContacts.map((contact) => (
            <MotionBox
              key={contact.id}
              whileHover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              whileTap={{ scale: 0.98 }}
            >
              <Box
                p={4}
                cursor="pointer"
                borderBottom="1px solid"
                borderColor={borderColor}
                bg={selectedContact?.id === contact.id ? 'purple.50' : 'transparent'}
                onClick={() => {
                  setSelectedContact(contact);
                  markAsRead(contact.id);
                }}
              >
                <HStack spacing={3}>
                  <Box position="relative">
                    <Avatar
                      size="md"
                      src={contact.avatar}
                      name={contact.name}
                    />
                    <Box
                      position="absolute"
                      bottom={0}
                      right={0}
                      w={3}
                      h={3}
                      bg={contact.status === 'online' ? 'green.500' : 'gray.400'}
                      borderRadius="full"
                      border="2px solid"
                      borderColor={bg}
                    />
                  </Box>
                  
                  <VStack align="start" spacing={1} flex="1">
                    <HStack justify="space-between" width="100%">
                      <Text fontWeight="semibold" fontSize="sm">
                        {contact.name}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {contact.lastMessageTime}
                      </Text>
                    </HStack>
                    
                    <Text fontSize="sm" color={textColor} noOfLines={1}>
                      {contact.lastMessage}
                    </Text>
                  </VStack>
                  
                  {contact.unreadCount > 0 && (
                    <Badge colorScheme="purple" variant="solid" borderRadius="full">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </HStack>
              </Box>
            </MotionBox>
          ))}
        </VStack>
      </Box>

      {/* Chat Area */}
      {selectedContact ? (
        <Box flex="1" display="flex" flexDirection="column">
          {/* Chat Header */}
          <Box
            p={4}
            bg={bg}
            borderBottom="1px solid"
            borderColor={borderColor}
            display={{ base: 'flex', md: 'flex' }}
            alignItems="center"
            justifyContent="space-between"
          >
            <HStack spacing={3}>
              <Avatar
                size="md"
                src={selectedContact.avatar}
                name={selectedContact.name}
              />
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold">{selectedContact.name}</Text>
                <Text fontSize="sm" color={textColor}>
                  {selectedContact.status === 'online' ? 'В сети' : 'Не в сети'}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={2}>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<Phone size={18} />}
                aria-label="Call"
              />
              <IconButton
                size="sm"
                variant="ghost"
                icon={<Video size={18} />}
                aria-label="Video call"
              />
              <Menu>
                <MenuButton
                  as={IconButton}
                  size="sm"
                  variant="ghost"
                  icon={<MoreVertical size={18} />}
                  aria-label="More options"
                />
                <MenuList>
                  <MenuItem>Информация о контакте</MenuItem>
                  <MenuItem>Очистить историю</MenuItem>
                  <MenuItem>Заблокировать</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Box>

          {/* Messages */}
          <Box
            flex="1"
            overflow="auto"
            p={4}
            bg={useColorModeValue('gray.50', 'gray.900')}
          >
            <VStack spacing={4} align="stretch">
              <ReducedMotionAnimatePresence>
                {getCurrentContactMessages().map((message) => (
                  <MotionBox
                    key={message.id}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -20 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    alignSelf={message.sender === 'me' ? 'flex-end' : 'flex-start'}
                  >
                    <Box
                      maxW="70%"
                      bg={message.sender === 'me' ? messageBg : otherMessageBg}
                      color={message.sender === 'me' ? 'purple.800' : 'inherit'}
                      p={3}
                      borderRadius="lg"
                      position="relative"
                    >
                      <Text fontSize="sm" lineHeight="1.4">
                        {message.text}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={textColor}
                        mt={1}
                        textAlign="right"
                      >
                        {formatTime(message.timestamp)}
                      </Text>
                    </Box>
                  </MotionBox>
                ))}
              </ReducedMotionAnimatePresence>

              {isTyping && (
                <MotionBox
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  alignSelf="flex-start"
                >
                  <Box
                    bg={otherMessageBg}
                    p={3}
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Spinner size="sm" color="purple.500" />
                    <Text fontSize="sm" color={textColor}>
                      Печатает...
                    </Text>
                  </Box>
                </MotionBox>
              )}
              
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          {/* Message Input */}
          <Box
            p={4}
            bg={bg}
            borderTop="1px solid"
            borderColor={borderColor}
          >
            <HStack spacing={3}>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<Paperclip size={18} />}
                aria-label="Attach file"
              />
              
              <InputGroup>
                <Input
                  placeholder="Напишите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                />
                <InputRightElement>
                  <HStack spacing={1}>
                    <IconButton
                      size="sm"
                      variant="ghost"
                      icon={<Smile size={18} />}
                      aria-label="Emoji"
                    />
                    <IconButton
                      size="sm"
                      colorScheme="purple"
                      icon={<Send size={18} />}
                      onClick={sendMessage}
                      aria-label="Send message"
                      isDisabled={!newMessage.trim()}
                    />
                  </HStack>
                </InputRightElement>
              </InputGroup>
            </HStack>
          </Box>
        </Box>
      ) : (
        // Empty State
        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          <VStack spacing={4} textAlign="center">
            <Box
              p={6}
              bg="purple.100"
              borderRadius="full"
              color="purple.600"
            >
              <Icon as={MessageCircle} w={12} h={12} />
            </Box>
            <Text fontSize="lg" fontWeight="semibold" color="purple.600">
              Выберите чат
            </Text>
            <Text color={textColor}>
              Начните общение с другими пользователями
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  );
}

export default Chat;
