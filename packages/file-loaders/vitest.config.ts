import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // coverage: {
    //   all: false,
    //   provider: 'v8',
    //   reporter: ['text', 'json', 'lcov', 'text-summary'],
    //   reportsDirectory: './coverage/app',
    // },
    environment: 'happy-dom',
    // setupFiles: join(__dirname, './test/setup.ts'),
  },
});
