import React, { useState } from 'react';
import {
  Box,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Avatar,
  IconButton,
} from '@chakra-ui/react';
import { FaPaperPlane } from 'react-icons/fa';

function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Привет! Как у тебя дела?', sender: 'user1' },
    { id: 2, text: 'Привет! Всё отлично, спасибо!', sender: 'user2' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = { id: messages.length + 1, text: newMessage, sender: 'user1' };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      height="100vh"
      width="100%"
      bg="gray.50"
    >
      {/* Панель навигации с аватарами пользователей */}
      <Box
        width="15%"
        bg="purple.100"
        p={4}
        display="flex"
        flexDirection="column"
        justifyContent="start"
        alignItems="center"
        borderRight="1px solid purple.200"
      >
        <VStack spacing={4}>
          <Avatar name="User 1" src="https://bit.ly/dan-abramov" />
          <Avatar name="User 2" src="https://bit.ly/code-beast" />
          <Avatar name="User 3" />
        </VStack>
      </Box>

      {/* Окно чата */}
      <Box flex="1" p={6} display="flex" flexDirection="column" justifyContent="space-between">
        <VStack spacing={4} align="start" flex="1" overflowY="auto">
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.sender === 'user1' ? 'flex-start' : 'flex-end'}
              bg={message.sender === 'user1' ? 'purple.100' : 'purple.300'}
              color="black"
              p={3}
              borderRadius="lg"
              maxWidth="70%"
            >
              <Text>{message.text}</Text>
            </Box>
          ))}
        </VStack>

        {/* Ввод нового сообщения */}
        <HStack spacing={2} mt={4}>
          <Input
            placeholder="Напишите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            bg="white"
            borderColor="purple.200"
          />
          <IconButton
            icon={<FaPaperPlane />}
            colorScheme="purple"
            onClick={sendMessage}
            aria-label="Send message"
          />
        </HStack>
      </Box>
    </Box>
  );
}

export default Chat;
