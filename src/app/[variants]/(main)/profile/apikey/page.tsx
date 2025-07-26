import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/featureFlags';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Page from '../../settings/system-agent';
import Client from './Client';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('auth', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.apikey'),
    url: '/profile/apikey',
  });
};

const page = () => {
  const { showApiKeyManage } = serverFeatureFlags();

  if (!showApiKeyManage) return notFound();

  return <Client />;
};

Page.displayName = 'ApiKey';

export default page;
