# 🚀 Быстрый запуск проекта

## 📋 Предварительные требования

- Node.js 16+ 
- MongoDB (локально или Atlas)
- Git

## ⚡ Быстрый старт

### 1. Установка зависимостей
```bash
npm run install:all
```

### 2. Настройка переменных окружения

**Backend** (создайте файл `backend/.env`):
```env
DATABASE_URL=mongodb://localhost:27017/dogcourse
PORT=5000
NODE_ENV=development
```

**Frontend** (создайте файл `frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Dog Course App
VITE_DEBUG=true
```

### 3. Заполнение базы данных тестовыми курсами
```bash
cd backend
npm run seed
```

### 4. Запуск проекта

**Вариант 1: Запуск всего проекта одной командой**
```bash
npm run dev
```

**Вариант 2: Запуск по отдельности**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

### 5. Проверка работы
```bash
node check-status.js
```

## 🌐 Доступные URL

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 📱 Использование приложения

1. Откройте http://localhost:5173 в браузере
2. Просматривайте доступные курсы
3. Переходите между разделами через нижнюю навигацию
4. Тестируйте функциональность треков и профиля

## 🔧 Устранение проблем

### Backend не запускается
- Проверьте, что MongoDB запущена
- Убедитесь, что порт 5000 свободен
- Проверьте файл `.env` в папке backend

### Frontend не подключается к API
- Убедитесь, что backend запущен
- Проверьте `VITE_API_URL` в frontend/.env
- Проверьте CORS настройки

### Ошибки с зависимостями
```bash
# Очистите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

## 📞 Поддержка

Если возникли проблемы, проверьте:
1. Логи в терминале
2. Консоль браузера (F12)
3. README.md для подробной документации
