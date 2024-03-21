import { memo } from 'react';

import { gerServerDeviceInfo, isMobileDevice } from '@/utils/responsive';

import Alert from './Alert';
import DeviceCard from './DeviceInfo';
import PageTitle from './PageTitle';
import WebRTC from './WebRTC';

export default memo(() => {
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
});
