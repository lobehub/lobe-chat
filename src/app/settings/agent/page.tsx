'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';

import Agent from './Agent';

export default memo(() => {
  const { t } = useTranslation('setting');
  return (
    <>
      <PageTitle title={t('tab.agent')} />
      <Agent />
    </>
  );
});
