import { resolve } from 'node:path';
import type { UserConfig } from 'vite';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export const sharedConfig = {
  test: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      all: false,
      exclude: [
        // https://github.com/lobehub/lobe-chat/pull/7265
        ...coverageConfigDefaults.exclude,
        '__mocks__/**',
      ],
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
    ],
  },
};

export const sharedTestConfig = sharedConfig.test;
