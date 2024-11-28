import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/featureFlags';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.provider'),
    url: '/settings/provider',
  });
};

export default () => {
  const showLLM = serverFeatureFlags().showProvider;
  if (!showLLM) return notFound();

  return <Page />;
};
