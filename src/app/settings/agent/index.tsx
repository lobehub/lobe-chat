'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

import Agent from './Agent';

export default memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.Agent);
  const { t } = useTranslation('setting');
  return (
    <>
      <PageTitle title={t('tab.agent')} />
      <Agent />
    </>
  );
});
