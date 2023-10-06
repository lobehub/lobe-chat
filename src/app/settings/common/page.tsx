'use client';

import { memo } from 'react';

import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

import Common from './Common';

const CommonSetting = memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.Common);
  return <Common />;
});

export default CommonSetting;
