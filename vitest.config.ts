import { defineConfig } from 'vitest/config';

import { sharedTestConfig } from './vitest.shared';

export default defineConfig({
  test: {
    coverage: {
      ...sharedTestConfig.coverage,
      exclude: [
        ...sharedTestConfig.coverage.exclude,
        // just ignore the migration code
        // we will use pglite in the future
        // so the coverage of this file is not important
        'src/database/client/core/db.ts',
        'src/utils/fetch/fetchEventSource/*.ts',
      ],
      provider: 'v8',
      reportsDirectory: './coverage',
    }
  }
});
