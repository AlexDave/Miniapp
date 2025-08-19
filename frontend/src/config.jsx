// config.jsx
const config = {
  // Базовый URL API - используем переменную окружения или fallback
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Настройки приложения
  app: {
    name: 'Dog Course App',
    version: '1.0.0',
    description: 'Приложение для обучения с курсами и треками'
  },
  
  // Настройки API
  api: {
    timeout: 10000, // 10 секунд
    retryAttempts: 3,
    endpoints: {
      courses: '/api/courses',
      tracks: '/api/user/tracks',
      profile: '/api/user/profile'
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
  