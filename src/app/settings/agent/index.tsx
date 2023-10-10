'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Agent from './Agent';

export default memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.Agent);
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('tab.agent'));
  return (
    <>
      <PageTitle title={pageTitle} />
      <Agent />
    </>
  );
});
