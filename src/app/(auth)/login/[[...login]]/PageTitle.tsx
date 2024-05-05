'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';

const Title = memo(() => {
  const { t } = useTranslation('auth');

  return <PageTitle title={t('login')} />;
});
export default Title;
