import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    exclude: ['crypto', 'util', 'tty'],
    include: ['@lobehub/tts'],
  },
  test: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      all: false,
      exclude: ['__mocks__/**'],
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
  },
});
