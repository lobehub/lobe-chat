import Alert from './features/Alert';
import DeviceInfo from './features/DeviceInfo';
import WebRTC from './features/WebRTC';

const Page = ({ browser, os, mobile }: { browser?: string; mobile?: boolean; os?: string }) => {
  return (
    <>
      <Alert mobile={mobile} />
      <DeviceInfo browser={browser} os={os} />
      <WebRTC />
    </>
  );
};

Page.displayName = 'SyncSetting';

export default Page;
