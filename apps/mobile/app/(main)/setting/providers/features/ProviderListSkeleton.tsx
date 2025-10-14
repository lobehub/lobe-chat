import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Flexbox } from '@/components';

import ProviderCardSkeleton from './ProviderCardSkeleton';
import SectionHeader from './SectionHeader';

const ProviderListSkeleton = memo(() => {
  const { t } = useTranslation(['setting']);
  return (
    <Flexbox>
      <SectionHeader title={t('aiProviders.skeleton.enabled', { ns: 'setting' })} />
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />
      <SectionHeader title={t('aiProviders.skeleton.disabled', { ns: 'setting' })} />
      <ProviderCardSkeleton />
      <ProviderCardSkeleton />
    </Flexbox>
  );
});

export default ProviderListSkeleton;
