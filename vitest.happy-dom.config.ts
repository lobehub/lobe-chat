import { resolve } from 'node:path';
import { defaultServerConditions, type UserConfig } from 'vite';
import { coverageConfigDefaults, defineConfig, defineProject, mergeConfig } from 'vitest/config';

import { sharedTestConfig } from './vitest.shared';

export default defineProject({
  optimizeDeps: {
    exclude: ['crypto', 'util', 'tty'],
    include: ['@lobehub/tts'],
  },
  test: {
    name: 'happy-dom',
    alias: {
      ...sharedTestConfig.alias,
      '~test-utils': resolve(__dirname, './tests/utils.tsx'),
    },
    //coverage: {
    //  ...sharedTestConfig.coverage,
    //  exclude: [
    //    ...sharedTestConfig.coverage.exclude,
    //    // just ignore the migration code
    //    // we will use pglite in the future
    //    // so the coverage of this file is not important
    //    'src/database/client/core/db.ts',
    //    'src/utils/fetch/fetchEventSource/*.ts',
    //  ],
    //  provider: 'v8',
    //  reportsDirectory: './coverage/app',
    //},
    environment: 'happy-dom',
    exclude: [
      ...sharedTestConfig.exclude!,
      'src/database/server/**/**',
      'src/database/repositories/dataImporter/deprecated/**/**',
      'src/app/(backend)/webapi/**/*.test.ts',
      'src/libs/agent-runtime/**/*.test.ts',
    ],
    globals: true,
    server: {
      deps: {
        inline: [
          'vitest-canvas-mock',
        ],
      },
    },
    setupFiles: './tests/setup.ts',
  },
});
