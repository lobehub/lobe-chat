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
        '@lobehub/web': resolve(__dirname, '../../src'),
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
