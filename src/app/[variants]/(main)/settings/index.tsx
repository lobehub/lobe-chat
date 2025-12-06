'use client';

import { memo } from 'react';
import { useLoaderData } from 'react-router-dom';

import { SettingsTabParams } from '@/app/[variants]/loaders/routeParams';
import { SettingsTabs } from '@/store/global/initialState';

import { LayoutProps } from './_layout/type';
import SettingsContent from './features/SettingsContent';

const Layout = memo<LayoutProps>(() => {
  const { tab } = useLoaderData() as SettingsTabParams;

  const activeTab = (tab as SettingsTabs) || SettingsTabs.Profile;

  return <SettingsContent activeTab={activeTab} mobile={false} />;
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
