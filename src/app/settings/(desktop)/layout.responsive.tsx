'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';

import MobileSwitchLoading from '@/features/MobileSwitchLoading';
// TODO: need to be removed
import ResponsiveLayout from '@/layout/ServerResponsiveLayout/Client';

import DesktopLayout, { DesktopLayoutProps } from './layout.desktop';

const MobileLayout = dynamic(() => import('../(mobile)/layout.mobile'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default memo<DesktopLayoutProps>(({ children, activeTab }) => (
  <ResponsiveLayout Desktop={DesktopLayout} Mobile={MobileLayout} activeTab={activeTab}>
    {children}
  </ResponsiveLayout>
));
