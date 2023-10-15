'use client';

import dynamic from 'next/dynamic';
import { FC, PropsWithChildren, memo } from 'react';

import ResponsiveLayout from '@/layout/ResponsiveLayout.client';

import DesktopLayout from './layout.desktop';

const MobileLayout = dynamic(() => import('../(mobile)/layout.mobile'), { ssr: false }) as FC;

export default memo(({ children }: PropsWithChildren) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout}>
    {children}
  </ResponsiveLayout>
));
