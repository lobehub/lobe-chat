'use client';

import { useResponsive } from 'antd-style';
import { PropsWithChildren, memo } from 'react';

import Mobile from '../MobileLayout';
import Desktop from './Desktop';

const ResponsiveLayout = memo<PropsWithChildren>(({ children }) => {
  const { mobile } = useResponsive();

  return mobile ? <Mobile>{children}</Mobile> : <Desktop>{children}</Desktop>;
});

export default ResponsiveLayout;
