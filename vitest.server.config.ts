import {  defineConfig, defineProject } from 'vitest/config';

import { sharedTestConfig } from './vitest.shared';

export default defineProject({
  test: {
    name: 'server',
    alias: sharedTestConfig.alias,
    //coverage: {
    //  ...sharedTestConfig.coverage,
    //  exclude: [
    //    ...sharedTestConfig.coverage!.exclude!,
    //    'src/database/server/core/dbForTest.ts',
    //  ],
    //  include: ['src/database/models/**/*.ts', 'src/database/server/**/*.ts'],
    //  provider: 'v8',
    //  reportsDirectory: './coverage/server',
    //},
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
