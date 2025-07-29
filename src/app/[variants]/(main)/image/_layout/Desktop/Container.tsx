'use client';

import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const Container = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <Center
      flex={1}
      style={{
        background: theme.colorBgContainerSecondary,
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <Flexbox
        gap={16}
        height={'100%'}
        padding={24}
        style={{
          maxWidth: 906,
        }}
        width={'100%'}
      >
        {children}
      </Flexbox>
    </Center>
  );
});

export default Container;
