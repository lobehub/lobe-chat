import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';

import DetailLoading from './Detail/Loading';
import List from './List';

const Detail = dynamic(() => import('./Detail'), { loading: DetailLoading, ssr: false });

export const MCPPluginList = memo(() => {
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
        <List
          setIdentifier={(identifier) => {
            useToolStore.setState({ activeMCPIdentifier: identifier });
            ref?.current?.scrollTo({ top: 0 });
          }}
        />
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
        <Detail />
      </Flexbox>
    </Flexbox>
  );
});

export default MCPPluginList;
