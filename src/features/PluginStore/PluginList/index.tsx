import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Suspense, memo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import Detail from './Detail';
import DetailLoading from './Detail/Loading';
import List from './List';

export const PluginList = memo(() => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  return (
    <Flexbox
      height={'75vh'}
      horizontal
      style={{
        borderTop: `1px solid ${theme.colorBorderSecondary}`,
        overflow: 'hidden',
        position: 'relative',
      }}
      width={'100%'}
    >
      <DraggablePanel maxWidth={1024} minWidth={420} placement={'left'}>
        <List />
      </DraggablePanel>
      <Flexbox
        height={'100%'}
        padding={16}
        ref={ref}
        style={{
          background: theme.colorBgContainerSecondary,
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
        width={'100%'}
      >
        <Suspense fallback={<DetailLoading />}>
          <Detail />
        </Suspense>
      </Flexbox>
    </Flexbox>
  );
});

export default PluginList;
