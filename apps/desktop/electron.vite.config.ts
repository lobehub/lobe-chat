import dotenv from 'dotenv';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'node:path';

dotenv.config();

const updateChannel = process.env.UPDATE_CHANNEL || 'stable';
console.log(`[electron-vite.config.ts] Detected UPDATE_CHANNEL: ${updateChannel}`); // 添加日志确认

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
    },
    // 这里是关键：在构建时进行文本替换
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.OFFICIAL_CLOUD_SERVER': JSON.stringify(process.env.OFFICIAL_CLOUD_SERVER),
      'process.env.UPDATE_CHANNEL': JSON.stringify(process.env.UPDATE_CHANNEL),
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
