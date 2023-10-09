'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { useSwitchSideBarOnInit } from '@/store/global/hooks/useSwitchSettingsOnInit';
import { SettingsTabs } from '@/store/global/initialState';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Common from './Common';

export default memo(() => {
  useSwitchSideBarOnInit(SettingsTabs.Common);
  const { t } = useTranslation('setting');
  const pageTitle = genSiteHeadTitle(t('header.global'));
  return (
    <>
      <PageTitle title={pageTitle} />
      <Common />
    </>
  );
});
