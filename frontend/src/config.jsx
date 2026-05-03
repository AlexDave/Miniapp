// config.jsx
const config = {
  // Базовый URL API - используем переменную окружения или fallback
  baseUrl: import.meta.env.VITE_API_URL || '',
  
  // Настройки приложения
  app: {
    name: 'Dog Course App',
    version: '1.0.0',
    description: 'Приложение для обучения собак по программам и маршрутам'
  },
  
  // Настройки API
  api: {
    timeout: 10000, // 10 секунд
    retryAttempts: 3,
    endpoints: {
      courses: '/api/courses',
      profile: '/api/user/profile',
      achievements: '/api/user/achievements'
    }
  },
  
  // Настройки UI
  ui: {
    theme: {
      primary: 'purple',
      secondary: 'gray'
    },
    pagination: {
      itemsPerPage: 10
    }
  }
};

export default config;
  