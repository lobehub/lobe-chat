'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';
import { CURRENT_VERSION } from '@/const/version';

import Footer from '../features/Footer';
import Common, { SettingsCommonProps } from './Common';

export default memo<SettingsCommonProps>((props) => {
  const { t } = useTranslation('setting');

  return (
    <>
      <PageTitle title={t('tab.common')} />
      <Common {...props} />
      <Footer>LobeChat v{CURRENT_VERSION}</Footer>
    </>
  );
});
