import { notFound } from 'next/navigation';

import { serverFeatureFlags } from '@/config/server/featureFlags';
import { gerServerDeviceInfo, isMobileDevice } from '@/utils/responsive';

import Alert from './Alert';
import DeviceCard from './DeviceInfo';
import PageTitle from './PageTitle';
import WebRTC from './WebRTC';

export default () => {
  const enableWebrtc = serverFeatureFlags().enableWebrtc;

  if (!enableWebrtc) return notFound();

  const { os, browser } = gerServerDeviceInfo();
  const isMobile = isMobileDevice();

  return (
    <>
      {isMobile && <Alert mobile />}
      <PageTitle />
      <DeviceCard browser={browser} os={os} />
      <WebRTC />
      {!isMobile && <Alert />}
    </>
  );
};
