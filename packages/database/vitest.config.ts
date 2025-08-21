import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      /* eslint-disable sort-keys-fix/sort-keys-fix */
      '@/const': resolve(__dirname, '../const/src'),
      '@/database': resolve(__dirname, '../database/src'),
      '@/types': resolve(__dirname, '../types/src'),
      '@': resolve(__dirname, '../../src'),
      /* eslint-enable */
    },
    environment: 'happy-dom',
  },
});
