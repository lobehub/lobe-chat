import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/server/featureFlags';
import { translation } from '@/server/translation';
import { gerServerDeviceInfo, isMobileDevice } from '@/utils/responsive';

import Page from './index';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.sync'),
  };
};

export default () => {
  const enableWebrtc = serverFeatureFlags().enableWebrtc;
  if (!enableWebrtc) return notFound();

  const isMobile = isMobileDevice();
  const { os, browser } = gerServerDeviceInfo();

  return <Page browser={browser} mobile={isMobile} os={os} />;
};
