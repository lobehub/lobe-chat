import { DraggablePanel } from '@lobehub/ui';
import { Empty } from 'antd';
import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo, useRef, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import List from './List';

const Detail = dynamic(() => import('./Detail'), { ssr: false });

export const PluginList = memo<{ keywords?: string }>(({ keywords }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [identifier, setIdentifier] = useState<string>();
  const theme = useTheme();

  return (
    <Flexbox
      height={`75vh`}
      horizontal
      style={{
        borderTop: `1px solid ${theme.colorBorderSecondary}`,
        overflow: 'hidden',
        position: 'relative',
      }}
      width={'100%'}
    >
      <DraggablePanel maxWidth={1024} minWidth={320} placement={'left'}>
        <List
          identifier={identifier}
          keywords={keywords}
          setIdentifier={(identifier) => {
            setIdentifier(identifier);
            ref?.current?.scrollTo({ top: 0 });
          }}
        />
      </DraggablePanel>
      {identifier ? (
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
          <Detail identifier={identifier} />
        </Flexbox>
      ) : (
        <Center
          height={'100%'}
          style={{
            background: theme.colorBgContainerSecondary,
          }}
          width={'100%'}
        >
          <Empty description={'选择插件以预览详细信息'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </Center>
      )}
    </Flexbox>
  );
});

export default PluginList;
