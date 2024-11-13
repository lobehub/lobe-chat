import { isMobileDevice } from '@/utils/server/responsive';

import ChatHydration from './features/ChatHydration';
import DesktopChatInput from './features/ChatInput/Desktop';
import MobileChatInput from './features/ChatInput/Mobile';
import ChatList from './features/ChatList';
import ZenModeToast from './features/ZenModeToast';

const ChatConversation = () => {
  const mobile = isMobileDevice();
  const ChatInput = mobile ? MobileChatInput : DesktopChatInput;

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
