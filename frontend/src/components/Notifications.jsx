import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  useColorModeValue,
  SlideFade,
  Portal,
  CloseButton,
  Divider,
  Avatar,
  Button
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Clock,
  Star
} from 'lucide-react';
import useStore from '../store';

const MotionBox = motion(Box);

function Notifications() {
  const { sidebarOpen, toggleSidebar, notifications, removeNotification } = useStore();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <AlertCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={20} color="#F59E0B" />;
      case 'info':
        return <Info size={20} color="#3B82F6" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'green.500';
      case 'error':
        return 'red.500';
      case 'warning':
        return 'yellow.500';
      case 'info':
        return 'blue.500';
      default:
        return 'gray.500';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return `${Math.floor(diffInMinutes / 1440)} дн назад`;
  };

  if (!sidebarOpen) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.5)"
        zIndex={30}
        onClick={toggleSidebar}
      >
        <MotionBox
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          position="absolute"
          top={0}
          left={0}
          width="100%"
          maxW="400px"
          height="100vh"
          bg={bg}
          borderRight="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <Box
            p={4}
            borderBottom="1px solid"
            borderColor={borderColor}
            bg={useColorModeValue('gray.50', 'gray.700')}
          >
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Box
                  p={2}
                  bg="purple.100"
                  borderRadius="full"
                  color="purple.600"
                >
                  <Bell size={20} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold" fontSize="lg">
                    Уведомления
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    {notifications.length} новых
                  </Text>
                </VStack>
              </HStack>
              <CloseButton onClick={toggleSidebar} />
            </HStack>
          </Box>

          {/* Notifications List */}
          <Box flex="1" overflow="auto">
            {notifications.length === 0 ? (
              <VStack spacing={4} p={8} textAlign="center">
                <Box
                  p={4}
                  bg="gray.100"
                  _dark={{ bg: 'gray.700', color: 'gray.300' }}
                  borderRadius="full"
                  color="gray.500"
                >
                  <Bell size={32} />
                </Box>
                <Text fontWeight="semibold" color="gray.500" _dark={{ color: 'gray.300' }}>
                  Нет уведомлений
                </Text>
                <Text fontSize="sm" color={textColor}>
                  Новые уведомления появятся здесь
                </Text>
              </VStack>
            ) : (
              <VStack spacing={0} align="stretch">
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <MotionBox
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box
                        p={4}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        position="relative"
                      >
                        <HStack spacing={3} align="start">
                          <Box
                            p={2}
                            bg={`${getNotificationColor(notification.type)}.100`}
                            borderRadius="full"
                            color={getNotificationColor(notification.type)}
                          >
                            {getNotificationIcon(notification.type)}
                          </Box>
                          
                          <VStack align="start" spacing={1} flex="1">
                            <HStack justify="space-between" width="100%">
                              <Text fontWeight="semibold" fontSize="sm">
                                {notification.title}
                              </Text>
                              <HStack spacing={2}>
                                <Text fontSize="xs" color={textColor}>
                                  {formatTime(notification.timestamp)}
                                </Text>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  icon={<X size={14} />}
                                  onClick={() => removeNotification(notification.id)}
                                  aria-label="Close notification"
                                />
                              </HStack>
                            </HStack>
                            
                            <Text fontSize="sm" color={textColor} lineHeight="1.4">
                              {notification.message}
                            </Text>
                            
                            {notification.action && (
                              <Button
                                size="sm"
                                variant="outline"
                                colorScheme="purple"
                                mt={2}
                                onClick={notification.action.onClick}
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    </MotionBox>
                  ))}
                </AnimatePresence>
              </VStack>
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box
              p={4}
              borderTop="1px solid"
              borderColor={borderColor}
              bg={useColorModeValue('gray.50', 'gray.700')}
            >
              <Button
                size="sm"
                variant="ghost"
                color="purple.500"
                width="100%"
                onClick={() => {
                  notifications.forEach(n => removeNotification(n.id));
                }}
              >
                Очистить все
              </Button>
            </Box>
          )}
        </MotionBox>
      </Box>
    </Portal>
  );
}

export default Notifications;
