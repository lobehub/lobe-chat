import React, { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import List from '@/features/NavPanel/Body/Agent/List';
import { AgentModalProvider } from '@/features/NavPanel/Body/Agent/ModalProvider';
import SkeletonList from '@/features/NavPanel/Body/SkeletonList';

const SwitchContent = memo(() => {
  return (
    <Suspense fallback={<SkeletonList rows={6} />}>
      <AgentModalProvider>
        <Flexbox
          gap={4}
          padding={8}
          style={{
            maxHeight: '50vh',
            overflowY: 'auto',
            width: 240,
          }}
        >
          <List />
        </Flexbox>
      </AgentModalProvider>
    </Suspense>
  );
});

export default SwitchContent;
