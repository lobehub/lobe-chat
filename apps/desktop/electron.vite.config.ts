import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'node:path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
    },
    plugins: [externalizeDepsPlugin({})],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/main'),
      },
    },
  },
  preload: {
    build: {
      outDir: 'dist/preload',
    },
    plugins: [externalizeDepsPlugin({})],
  },
});
