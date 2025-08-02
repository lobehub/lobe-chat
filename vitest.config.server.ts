import { resolve } from 'node:path';
import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      /* eslint-disable sort-keys-fix/sort-keys-fix */
      '@/types': resolve(__dirname, './packages/types/src'),
      '@': resolve(__dirname, './src'),
      /* eslint-enable */
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
    env: {
      TEST_SERVER_DB: '1',
    },
    environment: 'node',
    include: ['src/database/models/**/**/*.test.ts', 'src/database/server/**/**/*.test.ts'],
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    setupFiles: './tests/setup-db.ts',
  },
});
