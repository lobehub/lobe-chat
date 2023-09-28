'use client';

import { memo } from 'react';

import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

import Layout from '../index';
import Agent from './Agent';

const AgentSetting = memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.Agent);
  return (
    <Layout>
      <Agent />
    </Layout>
  );
});

export default AgentSetting;
