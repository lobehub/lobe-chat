import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({})],
  },
  preload: {
    build: {},
    plugins: [externalizeDepsPlugin({})],
  },
});
