import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/server/featureFlags';
import { translation } from '@/server/translation';
import { gerServerDeviceInfo, isMobileDevice } from '@/utils/responsive';

import Alert from './features/Alert';
import DeviceInfo from './features/DeviceInfo';
import WebRTC from './features/WebRTC';

export const generateMetadata = async () => {
  const { t } = await translation('setting');
  return {
    title: t('tab.sync'),
  };
};

const Page = () => {
  const enableWebrtc = serverFeatureFlags().enableWebrtc;
  if (!enableWebrtc) return notFound();

  const isMobile = isMobileDevice();
  const { os, browser } = gerServerDeviceInfo();

  return (
    <>
      <DeviceInfo browser={browser} os={os} />
      <WebRTC />
      <Alert mobile={isMobile} />
    </>
  );
};

Page.displayName = 'SyncSetting';

export default Page;
