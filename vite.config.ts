import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    // Reduce chunk size warning limit since we split manually
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries — rarely change, cache aggressively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase — large SDK, load only when needed
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions', 'firebase/storage'],
          // Chart.js — only needed on Dashboard, Community, Home
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          // Framer Motion — only needed on pages with animations
          'vendor-motion': ['framer-motion'],
          // Map library — only needed on Community page
          'vendor-maps': ['react-simple-maps'],
          // PDF generation — only needed on Dashboard export
          'vendor-pdf': ['jspdf', 'jspdf-autotable'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  },
});