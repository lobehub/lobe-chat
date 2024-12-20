import { isMobileDevice } from '@/utils/server/responsive';

import ChatHydration from './features/ChatHydration';
import ChatInput from './features/ChatInput';
import ChatList from './features/ChatList';
import ThreadHydration from './features/ThreadHydration';
import ZenModeToast from './features/ZenModeToast';

const ChatConversation = async () => {
  const mobile = await isMobileDevice();

  return (
    <>
      <ZenModeToast />
      <ChatList mobile={mobile} />
      <ChatInput mobile={mobile} />
      <ChatHydration />
      <ThreadHydration />
    </>
  );
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
