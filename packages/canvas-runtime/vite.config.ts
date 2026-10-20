import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { lobeUiImports } from '../../plugins/vite/lobeUiImports';

export default defineConfig({
  build: {
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: 'src/index.tsx',
      fileName: () => 'canvas-runtime.js',
      formats: ['iife'],
      name: 'LobeCanvasRuntime',
    },
    outDir: 'dist',
    rolldownOptions: {
      output: { assetFileNames: 'canvas-runtime.css' },
    },
  },
  define: { 'process.env.NODE_ENV': '"production"' },
  plugins: [react(), ...lobeUiImports()],
});
