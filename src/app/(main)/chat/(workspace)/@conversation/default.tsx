import Conversation from '@/features/Conversation';
import { isMobileDevice } from '@/utils/server/responsive';

import ChatHydration from './features/ChatHydration';
import DesktopChatInput from './features/ChatInput/Desktop';
import MobileChatInput from './features/ChatInput/Mobile';
import ZenModeToast from './features/ZenModeToast';

const ChatConversation = () => {
  const mobile = isMobileDevice();
  const ChatInput = mobile ? MobileChatInput : DesktopChatInput;

  return (
    <>
      <ZenModeToast />
      <Conversation mobile={mobile} />
      <ChatInput />
      <ChatHydration />
    </>
  );
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
