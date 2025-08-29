import { gerServerDeviceInfo } from '@lobechat/utils/server';
import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/featureFlags';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Page from './index';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('setting', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.sync'),
    url: '/settings/sync',
  });
};
export default async (props: DynamicLayoutProps) => {
  const enableWebrtc = serverFeatureFlags().enableWebrtc;
  if (!enableWebrtc) return notFound();

  const isMobile = await RouteVariants.getIsMobile(props);
  const { os, browser } = await gerServerDeviceInfo();

  return <Page browser={browser} mobile={isMobile} os={os} />;
};
