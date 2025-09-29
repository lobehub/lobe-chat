import { isDesktop } from '@/const/version';

import Conversation from './features/Conversation';
import Desktop from './features/Desktop';
import Essential from './features/Essential';

const Page = () => {
  return (
    <>
      {isDesktop && <Desktop />}
      <Essential />
      <Conversation />
    </>
  );
};

Page.displayName = 'HotkeySetting';

export default Page;
