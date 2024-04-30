'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';

import TTS from './TTS';

export default memo(() => {
  const { t } = useTranslation('setting');
  return (
    <>
      <PageTitle title={t('tab.tts')} />
      <TTS />
    </>
  );
});
