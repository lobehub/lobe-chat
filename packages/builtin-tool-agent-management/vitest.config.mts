import { defineConfig } from 'vitest/config';

import { stylexPlugin } from '../../plugins/vite/stylex';

export default defineConfig({
  plugins: [stylexPlugin()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    environment: 'node',
  },
});
