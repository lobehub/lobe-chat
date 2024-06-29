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
      '~test-utils': resolve(__dirname, './tests/utils.tsx'),
    },
    coverage: {
      all: false,
      exclude: [
        '__mocks__/**',
        // just ignore the migration code
        // we will use pglite in the future
        // so the coverage of this file is not important
        'src/database/client/core/db.ts',
      ],
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
      reportsDirectory: './coverage/app',
    },
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    environment: 'happy-dom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'src/database/server/**/**',
      'src/server/modules/**/**',
    ],
    globals: true,
    setupFiles: './tests/setup.ts',
  },
});
