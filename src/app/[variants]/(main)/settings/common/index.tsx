import Appearance from './features/Appearance';
import ChatAppearance from './features/ChatAppearance';
import Common from './features/Common/Common';

const Page = () => {
  return (
    <>
      <Common/>
      <Appearance />
      <ChatAppearance />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
