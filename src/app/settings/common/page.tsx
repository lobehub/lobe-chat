'use client';

import { memo } from 'react';

import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

import Layout from '../index';
import Common from './Common';

const CommonSetting = memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.Common);
  return (
    <Layout>
      <Common />
    </Layout>
  );
});

export default CommonSetting;
