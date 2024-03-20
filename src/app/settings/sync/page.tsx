import { memo } from 'react';

import { gerServerDeviceInfo } from '@/utils/responsive';

import DeviceCard from './DeviceInfo';
import PageTitle from './PageTitle';
import WebRTC from './WebRTC';

export default memo(() => {
  const { os, browser } = gerServerDeviceInfo();
  return (
    <>
      <PageTitle />
      <DeviceCard browser={browser} os={os} />
      <WebRTC />
    </>
  );
});
