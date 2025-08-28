import Appearance from './features/Appearance';
import ChatAppearance from './features/ChatAppearance';
import Common from './features/Common/Common';

const Page = (props: any) => {
  return (
    < >
      <Common {...props} />
      <Appearance />
      <ChatAppearance />
    </>
  );
};

Page.displayName = 'CommonSetting';

export default Page;
