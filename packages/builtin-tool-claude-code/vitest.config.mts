import { defineConfig } from 'vitest/config';

import { stylexPlugin } from '../../plugins/vite/stylex';

export default defineConfig({
  plugins: [stylexPlugin()],
  test: {
    environment: 'node',
  },
});
