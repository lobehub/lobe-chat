'use client';

import { memo } from 'react';

import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

import LLM from './LLM';

const LLMSetting = memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.LLM);
  return <LLM />;
});

export default LLMSetting;
