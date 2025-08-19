import React from 'react';
import { Box, VStack, Text, Button, Icon } from '@chakra-ui/react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Логирование ошибки (в продакшене можно отправлять в сервис аналитики)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={4}
          bg="gray.50"
        >
          <VStack spacing={6} maxW="md" textAlign="center">
            <Icon as={FaExclamationTriangle} w={16} h={16} color="red.500" />
            
            <VStack spacing={2}>
              <Text fontSize="2xl" fontWeight="bold" color="red.600">
                Что-то пошло не так
              </Text>
              <Text color="gray.600">
                Произошла непредвиденная ошибка. Попробуйте обновить страницу.
              </Text>
            </VStack>

            <VStack spacing={3} width="100%">
              <Button
                colorScheme="purple"
                onClick={this.handleReset}
                width="100%"
              >
                Попробовать снова
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                width="100%"
              >
                Обновить страницу
              </Button>
            </VStack>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                mt={4}
                p={4}
                bg="gray.100"
                borderRadius="md"
                width="100%"
                textAlign="left"
              >
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  Детали ошибки (только для разработки):
                </Text>
                <Text fontSize="xs" color="gray.700" fontFamily="mono">
                  {this.state.error.toString()}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
