'use client';

import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Container = memo<PropsWithChildren>(({ children }) => {
  const theme = useTheme();

  return (
    <Flexbox
      flex={1}
      gap={16}
      padding={24}
      style={{
        background: theme.colorBgContainerSecondary,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {children}
    </Flexbox>
  );
});

export default Container;
