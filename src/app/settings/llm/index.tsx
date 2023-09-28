'use client';

import { memo } from 'react';

import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

import Layout from '../index';
import LLM from './LLM';

const LLMSetting = memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.LLM);
  return (
    <Layout>
      <LLM />
    </Layout>
  );
});

export default LLMSetting;
