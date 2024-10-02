import { SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';
import { memo } from 'react';

import { templateFiles } from './template';

interface ReactRendererProps {
  code: string;
}
const ReactRenderer = memo<ReactRendererProps>(({ code }) => {
  return (
    <SandpackProvider
      customSetup={{
        dependencies: {
          '@lshay/ui': 'latest',
          '@radix-ui/react-alert-dialog': 'latest',
          '@radix-ui/react-dialog': 'latest',
          '@radix-ui/react-icons': 'latest',
          'antd': 'latest',
          'class-variance-authority': 'latest',
          'clsx': 'latest',
          'lucide-react': 'latest',
          'recharts': 'latest',
          'tailwind-merge': 'latest',
        },
      }}
      files={{
        'App.tsx': code,
        ...templateFiles,
      }}
      options={{
        externalResources: ['https://cdn.tailwindcss.com'],
        visibleFiles: ['App.tsx'],
      }}
      style={{ height: '100%' }}
      template="vite-react-ts"
      theme="auto"
    >
      <SandpackLayout style={{ height: '100%' }}>
        <SandpackPreview style={{ height: '100%' }} />
      </SandpackLayout>
    </SandpackProvider>
  );
});

export default ReactRenderer;
