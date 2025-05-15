import Appearance from './features/Appearance';
import ChatAppearance from './features/ChatAppearance';
import Common from './features/Common';
import System from './features/System';

const Page = () => {
  return (
    <>
      <Common />
      <Appearance />
      <ChatAppearance />
      <System />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
