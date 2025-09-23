import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      // TODO: 目前仍然残留 ModelRuntime.test.ts 中的部分测试依赖了主项目的内容，后续需要拆分测试
      '@': resolve(__dirname, '../../src'),
    },
    coverage: {
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    environment: 'happy-dom',
  },
});
