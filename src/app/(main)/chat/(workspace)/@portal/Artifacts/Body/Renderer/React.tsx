import { SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';
import { memo } from 'react';

interface ReactRendererProps {
  code: string;
}
const ReactRenderer = memo<ReactRendererProps>(({ code }) => {
  return (
    <SandpackProvider
      customSetup={{
        dependencies: {
          antd: 'latest',
        },
      }}
      files={{
        'App.js': code,
      }}
      options={{ externalResources: ['https://cdn.tailwindcss.com'] }}
      style={{ height: '100%' }}
      template="react"
      theme="auto"
    >
      <SandpackLayout style={{ height: '100%' }}>
        <SandpackPreview style={{ height: '100%' }} />
      </SandpackLayout>
    </SandpackProvider>
  );
});

export default ReactRenderer;
