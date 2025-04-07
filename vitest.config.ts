import { resolve } from 'node:path';
import { defaultServerConditions } from 'vite';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  optimizeDeps: {
    exclude: ['crypto', 'util', 'tty'],
    include: ['@lobehub/tts'],
  },
  ssr: {
    resolve: {
      // TODO: Check the impact to other tests
      conditions: ['browser', ...defaultServerConditions.filter((v) => v !== 'module')],
    },
  },
  test: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~test-utils': resolve(__dirname, './tests/utils.tsx'),
    },
    coverage: {
      all: false,
      exclude: [
        // https://github.com/lobehub/lobe-chat/pull/7265
        ...coverageConfigDefaults.exclude,
        '__mocks__/**',
        // just ignore the migration code
        // we will use pglite in the future
        // so the coverage of this file is not important
        'src/database/client/core/db.ts',
        'src/utils/fetch/fetchEventSource/*.ts',
      ],
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
      reportsDirectory: './coverage/app',
    },
    environment: 'happy-dom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'src/database/server/**/**',
      'src/database/repositories/dataImporter/deprecated/**/**',
    ],
    globals: true,
    server: {
      deps: {
        inline: [
          // Direct module exports requiring mocks. Refs: https://github.com/vitest-dev/vitest/issues/5625#issuecomment-2078969371
          '@azure-rest/ai-inference',
          'vitest-canvas-mock',
        ],
      },
    },
    setupFiles: './tests/setup.ts',
  },
});
