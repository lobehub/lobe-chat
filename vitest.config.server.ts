import { resolve } from 'node:path';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    coverage: {
      all: false,
      exclude: [
        // https://github.com/lobehub/lobe-chat/pull/7265
        ...coverageConfigDefaults.exclude,
        'src/database/server/core/dbForTest.ts',
      ],
      include: ['src/database/models/**/*.ts', 'src/database/server/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
      reportsDirectory: './coverage/server',
    },
    environment: 'node',
    include: ['src/database/models/**/**/*.test.ts', 'src/database/server/**/**/*.test.ts'],
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    setupFiles: './tests/setup-db.ts',
    env: {
      TEST_SERVER_DB: '1',
    },
  },
});
