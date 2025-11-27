import { Popover } from 'antd';
import React, { PropsWithChildren, Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import List from '@/app/[variants]/(main)/home/_layout/Body/Agent/List';
import { AgentModalProvider } from '@/app/[variants]/(main)/home/_layout/Body/Agent/ModalProvider';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';

const SwitchPanel = memo<PropsWithChildren>(({ children }) => {
  return (
    <Popover
      arrow={false}
      content={
        <Suspense fallback={<SkeletonList rows={6} />}>
          <AgentModalProvider>
            <Flexbox
              gap={4}
              padding={8}
              style={{
                maxHeight: '50vh',
                overflowY: 'auto',
              }}
            >
              <List />
            </Flexbox>
          </AgentModalProvider>
        </Suspense>
      }
      placement={'bottomLeft'}
      styles={{
        body: {
          padding: 0,
          width: 240,
        },
      }}
      trigger={['click']}
    >
      {children}
    </Popover>
  );
});

export default SwitchPanel;
