import { isMobileDevice } from '@/utils/server/responsive';

import ChatHydration from './features/ChatHydration';
import ChatInput from './features/ChatInput';
import ChatList from './features/ChatList';
import ZenModeToast from './features/ZenModeToast';

const ChatConversation = () => {
  const mobile = isMobileDevice();

  return (
    <>
      <ZenModeToast />
      <ChatList mobile={mobile} />
      <ChatInput />
      <ChatHydration />
    </>
  );
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
