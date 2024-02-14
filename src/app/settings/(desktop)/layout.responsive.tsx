'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import ResponsiveLayout from '@/layout/ResponsiveLayout.client';

import DesktopLayout, { DesktopLayoutProps } from './layout.desktop';

const MobileLayout = dynamic(() => import('../(mobile)/layout.mobile'), { ssr: false }) as FC;

export default memo<DesktopLayoutProps>(({ children, activeTab }) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout} activeTab={activeTab}>
    {children}
  </ResponsiveLayout>
));
