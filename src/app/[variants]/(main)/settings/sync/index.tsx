import { Suspense } from 'react';

import Alert from './features/Alert';
import DeviceInfo from './features/DeviceInfo';
import WebRTC from './features/WebRTC';

const Page = ({ browser, os, mobile }: { browser?: string; mobile?: boolean; os?: string }) => {
  return (
    <Suspense>
      <DeviceInfo browser={browser} os={os} />
      <WebRTC />
      <Alert mobile={mobile} />
    </Suspense>
  );
};

Page.displayName = 'SyncSetting';

export default Page;
