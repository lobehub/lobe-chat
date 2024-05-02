import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/server/featureFlags';
import { translation } from '@/server/translation';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.llm'),
  };
};

export default () => {
  const showLLM = serverFeatureFlags().showLLM;
  if (!showLLM) return notFound();

  return <Page />;
};
