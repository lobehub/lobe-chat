import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/server/featureFlags';
import { translation } from '@/server/translation';
import { ogService } from '@/services/og';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return ogService.generate({
    description: t('tab.llm'),
    title: t('header.desc'),
    url: '/settings/llm',
  });
};

export default () => {
  const showLLM = serverFeatureFlags().showLLM;
  if (!showLLM) return notFound();

  return <Page />;
};
