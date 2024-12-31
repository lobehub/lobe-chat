import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/featureFlags';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { gerServerDeviceInfo, isMobileDevice } from '@/utils/server/responsive';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.sync'),
    url: '/settings/sync',
  });
};
export default async () => {
  const enableWebrtc = serverFeatureFlags().enableWebrtc;
  if (!enableWebrtc) return notFound();

  const isMobile = await isMobileDevice();
  const { os, browser } = await gerServerDeviceInfo();

  return <Page browser={browser} mobile={isMobile} os={os} />;
};
