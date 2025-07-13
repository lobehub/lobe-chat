'use client';

import { useTranslation } from 'react-i18next';

import PageTitle from '@/components/PageTitle';

import ProxyForm from './features/ProxyForm';

const ProxySettings = () => {
  const { t } = useTranslation('setting');

  return (
    <div>
      <PageTitle title={t('tab.proxy')} />
      <ProxyForm />
    </div>
  );
};

ProxySettings.displayName = 'ProxySettings';

export default ProxySettings;
