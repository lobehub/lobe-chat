'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';

import TTS from './TTS';

export default memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.TTS);
  const { t } = useTranslation('setting');
  return (
    <>
      <PageTitle title={t('tab.llm')} />
      <TTS />
    </>
  );
});
