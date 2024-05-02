import Conversation from '@/features/Conversation';
import { isMobileDevice } from '@/utils/responsive';

import DesktopChatInput from './features/ChatInput/Desktop';
import MobileChatInput from './features/ChatInput/Mobile';

const ChatConversation = () => {
  const mobile = isMobileDevice();
  const ChatInput = mobile ? MobileChatInput : DesktopChatInput;

  return <Conversation chatInput={<ChatInput />} mobile={mobile} />;
};

ChatConversation.displayName = 'ChatConversation';

export default ChatConversation;
