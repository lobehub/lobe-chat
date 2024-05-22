import Alert from './features/Alert';
import DeviceInfo from './features/DeviceInfo';
import Liveblocks from './features/Liveblocks';
import WebRTC from './features/WebRTC';

const Page = ({ browser, os, mobile }: { browser?: string; mobile?: boolean; os?: string }) => {
  return (
    <>
      <DeviceInfo browser={browser} os={os} />
      <WebRTC />
      <Liveblocks />
      <Alert mobile={mobile} />
    </>
  );
};

Page.displayName = 'SyncSetting';

export default Page;
