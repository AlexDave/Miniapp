import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/** Спринт 25: ранняя подгрузка чанка с useTodayLesson (хеш в проде подставляет Vite). */
void import('./hooks/useLessons.js');

const container = document.getElementById('root');
const root = createRoot(container); // Создаём корневой элемент

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
