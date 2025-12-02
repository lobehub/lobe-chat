'use client';

import { memo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SettingsTabs } from '@/store/global/initialState';

import { LayoutProps } from './_layout/type';
import SettingsContent from './features/SettingsContent';

const Layout = memo<LayoutProps>(() => {
  const [searchParams] = useSearchParams();

  const active = (searchParams.get('active') as SettingsTabs)
    ? (searchParams.get('active') as SettingsTabs)
    : SettingsTabs.Profile;

  return <SettingsContent activeTab={active} mobile={false} />;
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
