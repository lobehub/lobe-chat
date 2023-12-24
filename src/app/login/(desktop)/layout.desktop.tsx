'use client';

import { useTheme } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsPWA } from '@/hooks/useIsPWA';

const LoginDesktopLayout = memo<PropsWithChildren>(({ children }) => {
  const isPWA = useIsPWA();
  const theme = useTheme();
  return (
    <Flexbox
      height={'100%'}
      horizontal
      id={'LoginDesktopLayout'}
      style={isPWA ? { borderTop: `1px solid ${theme.colorBorder}` } : {}}
      width={'100%'}
    >
      {children}
    </Flexbox>
  );
});

export default LoginDesktopLayout;
