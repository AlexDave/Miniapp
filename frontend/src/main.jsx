import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Получите элемент с id 'root'
const rootElement = document.getElementById('root');

// Создайте корневой элемент
const root = ReactDOM.createRoot(rootElement);

// Рендеринг приложения
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
