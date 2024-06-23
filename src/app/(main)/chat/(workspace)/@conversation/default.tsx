import Conversation from '@/features/Conversation';
import { isMobileDevice } from '@/utils/responsive';

import ChatHydration from './features/ChatHydration';
import DesktopChatInput from './features/ChatInput/Desktop';
import MobileChatInput from './features/ChatInput/Mobile';

const ChatConversation = () => {
  const mobile = isMobileDevice();
  const ChatInput = mobile ? MobileChatInput : DesktopChatInput;

  return (
    <>
      <Conversation mobile={mobile} />
      <ChatInput />
      <ChatHydration />
    </>
  );
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
