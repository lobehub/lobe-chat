import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // alias: {
    //   /* eslint-disable sort-keys-fix/sort-keys-fix */
    //   '@/const': resolve(__dirname, './packages/const/src'),
    //   '@/database': resolve(__dirname, './packages/database/src'),
    //   '@/types': resolve(__dirname, './packages/types/src'),
    //   '@': resolve(__dirname, './src'),
    //   /* eslint-enable */
    // },
    coverage: {
      all: false,
      exclude: [
        // https://github.com/lobehub/lobe-chat/pull/7265
        ...coverageConfigDefaults.exclude,
        'packages/database/src/server/core/dbForTest.ts',
      ],
      include: ['packages/database/src/models/**/*.ts', 'packages/database/src/server/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
      reportsDirectory: './coverage/server',
    },
    env: {
      TEST_SERVER_DB: '1',
    },
    environment: 'node',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    setupFiles: './tests/setup-db.ts',
  },
});
