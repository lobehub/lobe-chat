import { resolve } from 'node:path';
import { defaultServerConditions, type UserConfig } from 'vite';
import { coverageConfigDefaults, defineConfig, defineProject } from 'vitest/config';

import { sharedTestConfig } from './vitest.shared';
import happyDomConfig from './vitest.happy-dom.config';

export default defineProject({
  ...happyDomConfig,
  ssr: {
    resolve: {
      // TODO: Check the impact to other tests
      conditions: ['browser', ...defaultServerConditions.filter((v) => v !== 'module')],
    },
  },
  test: {
    name: 'edge-runtime',
    alias: {
      '@': resolve(__dirname, './src'),
      '~test-utils': resolve(__dirname, './tests/utils.tsx'),
    },
    environment: 'edge-runtime',
    exclude: [
      ...sharedTestConfig.exclude,
      'src/database/server/**/**',
      'src/database/repositories/dataImporter/deprecated/**/**',
    ],
    include: [
      'src/app/(backend)/webapi/**/*.test.ts',
      'src/libs/agent-runtime/**/*.test.ts',
    ],
    server: {
      deps: {
        inline: [
          // Direct module exports requiring mocks. Refs: https://github.com/vitest-dev/vitest/issues/5625#issuecomment-2078969371
          '@azure-rest/ai-inference',
          'vitest-canvas-mock',
        ],
      },
    },
  },
});
