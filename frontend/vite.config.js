import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('@chakra-ui')) return 'chakra';
          if (id.includes('@emotion')) return 'emotion';
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('react-router')) return 'router';
          if (id.includes('react-query')) return 'rq';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('axios')) return 'http';
          if (id.includes('zustand')) return 'zustand';
          if (id.includes('node_modules/react/') || id.includes('node_modules\\react\\')) return 'react-core';
          return 'vendor';
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
  },
});
