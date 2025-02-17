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
        '~common': resolve(__dirname, 'src/common'),
      },
    },
  },
  preload: {
    build: {
      outDir: 'dist/preload',
    },
    plugins: [externalizeDepsPlugin({})],
    resolve: {
      alias: {
        '~common': resolve(__dirname, 'src/common'),
      },
    },
  },
});
