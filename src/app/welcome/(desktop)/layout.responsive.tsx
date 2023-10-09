'use client';

import { PropsWithChildren, memo } from 'react';

import ResponsiveLayout from '@/layout/ResponsiveLayout.client';

import MobileLayout from '../(mobile)/layout.mobile';
import DesktopLayout from './layout.desktop';

export default memo(({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout}>
    {children}
  </ResponsiveLayout>
));
