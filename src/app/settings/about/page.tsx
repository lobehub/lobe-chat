'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Footer from '@/app/settings/features/Footer';
import PageTitle from '@/components/PageTitle';
import { CURRENT_VERSION } from '@/const/version';
import { useGlobalStore } from '@/store/global';
import { commonSelectors } from '@/store/global/selectors';

import Analytics from './Analytics';

export default memo(() => {
  const { t } = useTranslation('setting');
  const enabledTelemetryChat = useGlobalStore(commonSelectors.enabledTelemetryChat);
  return (
    <>
      <PageTitle title={t('tab.tts')} />
      {enabledTelemetryChat && <Analytics />}
      <Footer>LobeChat v{CURRENT_VERSION}</Footer>
    </>
  );
});
