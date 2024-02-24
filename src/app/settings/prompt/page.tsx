'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Prompt from '@/app/settings/prompt/Prompt';
import PageTitle from '@/components/PageTitle';

export default memo(() => {
  const { t } = useTranslation('setting');
  return (
    <>
      <PageTitle title={t('tab.prompt')} />
      <Prompt />
    </>
  );
});
