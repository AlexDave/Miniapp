# Настройка базы данных для DogCourse

## 🚀 Быстрый старт с SQLite (рекомендуется для разработки)

### 1. Настройка SQLite
SQLite не требует установки сервера и идеально подходит для разработки.

Измените файл `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
```

### 2. Инициализация БД
```bash
cd backend
npm run db:setup
```

### 3. Запуск сервера
```bash
npm run dev
```

## 🐘 Настройка PostgreSQL (для продакшена)

### 1. Установка PostgreSQL

#### Windows
1. Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Установите с паролем для пользователя `postgres`
3. Запустите службу PostgreSQL

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Создание базы данных

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE dogcourse;

# Выйдите из psql
\q
```

### 3. Настройка .env
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/dogcourse"
JWT_SECRET="your-secret-key-here"
PORT=3001
NODE_ENV=development
```

### 4. Инициализация БД
```bash
cd backend
npm run db:setup
```

## 🔧 Альтернативные варианты

### Вариант 1: Docker PostgreSQL
```bash
# Запуск PostgreSQL в Docker
docker run --name postgres-dogcourse -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dogcourse -p 5432:5432 -d postgres

# Настройка .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dogcourse"
```

### Вариант 2: Supabase (облачная БД)
1. Создайте аккаунт на https://supabase.com
2. Создайте новый проект
3. Скопируйте connection string из настроек
4. Обновите .env:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Вариант 3: Railway
1. Создайте аккаунт на https://railway.app
2. Создайте PostgreSQL базу данных
3. Скопируйте connection string
4. Обновите .env

## 🐛 Решение проблем

### Ошибка подключения к PostgreSQL
```bash
# Проверьте, что PostgreSQL запущен
# Windows
services.msc  # Найдите "postgresql-x64-15" и убедитесь, что запущена

# macOS/Linux
sudo systemctl status postgresql
```

### Ошибка аутентификации
```bash
# Сбросьте пароль postgres
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';
\q
```

### Ошибка создания базы данных
```bash
# Создайте пользователя и базу данных
sudo -u postgres createuser --interactive
sudo -u postgres createdb dogcourse
```

### Ошибка Prisma
```bash
# Перегенерируйте клиент
npx prisma generate

# Сбросьте БД
npm run db:reset

# Принудительная синхронизация
npx prisma db push
```

## 📊 Проверка подключения

### Тест подключения
```bash
cd backend
npx prisma db pull
```

### Просмотр данных
```bash
npm run db:studio
```

## 🎯 Рекомендации

### Для разработки
- Используйте **SQLite** - быстро и просто
- Файл БД будет создан автоматически

### Для тестирования
- Используйте **Docker PostgreSQL** - изолированная среда

### Для продакшена
- Используйте **PostgreSQL** или **Supabase**
- Настройте резервное копирование
- Используйте connection pooling

## 📝 Следующие шаги

После успешной настройки БД:

1. Запустите инициализацию: `npm run db:setup`
2. Проверьте данные: `npm run db:studio`
3. Запустите сервер: `npm run dev`
4. Откройте http://localhost:3001

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `npm run dev`
2. Проверьте подключение: `npx prisma db pull`
3. Сбросьте БД: `npm run db:reset`
4. Создайте Issue в репозитории
