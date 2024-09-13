'use client';

import { useResponsive } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { xl = true } = useResponsive();

  return (
    <Flexbox
      flex={1}
      gap={16}
      horizontal={xl}
      paddingInline={48}
      style={{
        overflow: xl ? 'hidden' : 'auto',
        paddingBottom: xl ? 0 : 24,
        paddingTop: 48,
        position: 'relative',
      }}
      width={'100%'}
    >
      {children}
    </Flexbox>
  );
});

export default Layout;
