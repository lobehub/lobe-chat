interface TemplateFilesParams {
  title?: string;
}
export const createTemplateFiles = ({ title }: TemplateFilesParams = {}) => ({
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title || 'Artifacts App'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
`,
  'vite.config.ts': {
    code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/components/ui': '@lshay/ui/components/default',
    },
  },
});`,
  },
});
