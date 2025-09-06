import { join, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': resolve(__dirname, '../../src'),
    },
    coverage: {
      all: false,
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    environment: 'happy-dom',
    setupFiles: join(__dirname, './tests/setup.ts'),
  },
});
