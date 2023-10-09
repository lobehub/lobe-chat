'use client';

import { PropsWithChildren, memo } from 'react';

import ResponsiveLayout from '@/components/ResponsiveLayout';
import { useIsMobile } from '@/hooks/useIsMobile';

import MobileLayout from '../(mobile)/layout.mobile';
import DesktopLayout from './layout.desktop';

export default memo(({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout} isMobile={useIsMobile}>
    {children}
  </ResponsiveLayout>
));
