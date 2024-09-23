CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    video_url VARCHAR(255),
    content TEXT
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    title VARCHAR(255),
    required_per_day INTEGER,
    available_until TIMESTAMP
);

CREATE TABLE user_tasks (
    user_id INTEGER REFERENCES users(id),
    task_id INTEGER REFERENCES tasks(id),
    completed_today INTEGER DEFAULT 0,
    last_completed_at TIMESTAMP,
    progress INTEGER DEFAULT 0
);
