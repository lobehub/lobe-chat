import { Sandpack } from '@codesandbox/sandpack-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BuiltinPortalProps } from '@/types/tool';

const Portal = memo<BuiltinPortalProps>(({ arguments: args }) => {
  return (
    <Flexbox height={'100%'}>
      <Sandpack
        files={{
          'App.css': args.css || '',
          'App.js': args.app,
        }}
        template="react"
        theme="auto"
      />
    </Flexbox>
  );
});

export default Portal;
