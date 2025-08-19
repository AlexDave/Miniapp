# Структура Backend

## Обзор

Backend приложения разбит на модульную архитектуру для лучшей организации кода и использования переменных окружения.

## Структура папок

```
backend/src/
├── config/           # Конфигурация приложения
│   └── index.js      # Централизованная конфигурация
├── database/         # Работа с базой данных
│   └── connection.js # Подключение к MongoDB
├── middleware/       # Middleware функции
│   ├── index.js      # Экспорт всех middleware
│   ├── logger.js     # Логирование запросов
│   ├── cors.js       # Настройка CORS
│   └── auth.js       # Аутентификация пользователя
├── routes/           # Маршруты API
│   ├── index.js      # Экспорт всех маршрутов
│   ├── courses.js    # API для курсов
│   ├── tracks.js     # API для треков пользователя
│   └── system.js     # Системные эндпоинты
├── utils/            # Утилиты
│   └── validation.js # Валидация данных
├── app.js            # Основное приложение Express
└── server.js         # Запуск сервера
```

## Конфигурация

Все настройки приложения централизованы в `config/index.js`:

- **Database**: настройки подключения к MongoDB
- **Server**: порт, хост, окружение
- **CORS**: настройки CORS
- **Logging**: уровень логирования
- **App**: настройки приложения

## Переменные окружения

Создайте файл `.env` на основе `env.example`:

```env
# Database Configuration
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=dogcourse

# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info

# Application Configuration
TELEGRAM_ID=fake_telegram_id
USER_NAME=Test User
```

## Модули

### Database
Класс для работы с MongoDB с методами:
- `connect()` - подключение к базе данных
- `getDb()` - получение экземпляра базы данных
- `findOne()`, `find()`, `insertOne()`, `updateOne()` - операции с коллекциями

### Middleware
- **logger**: логирование HTTP запросов
- **cors**: настройка CORS политик
- **auth**: аутентификация пользователя

### Routes
- **courses**: API для работы с курсами
- **tracks**: API для работы с треками пользователя
- **system**: системные эндпоинты (health check, 404, error handling)

## Запуск

```bash
# Установка зависимостей
npm install

# Создание .env файла
cp env.example .env

# Запуск сервера
npm start
```

## API Endpoints

- `GET /api/courses` - список всех курсов
- `GET /api/courses/:id` - курс по ID
- `GET /api/user/tracks` - треки пользователя
- `POST /api/user/tracks` - добавление трека
- `PUT /api/user/tracks/:trackId` - выполнение задания
- `DELETE /api/user/tracks/:trackId` - удаление трека
- `GET /health` - проверка состояния сервера
