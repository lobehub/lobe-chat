'use client';

import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Container = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <Flexbox
      align={'center'}
      style={{
        background: theme.colorBgContainerSecondary,
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
      width={'100%'}
    >
      <Flexbox
        gap={24}
        paddingBlock={24}
        paddingInline={16}
        style={{
          width: 'min(100%, 1024px)',
        }}
      >
        {children}
      </Flexbox>
    </Flexbox>
  );
});

export default Container;
