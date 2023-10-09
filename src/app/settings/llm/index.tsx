'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import LLM from './LLM';

export default memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.LLM);
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('tab.llm'));
  return (
    <>
      <PageTitle title={pageTitle} />
      <LLM />
    </>
  );
});
