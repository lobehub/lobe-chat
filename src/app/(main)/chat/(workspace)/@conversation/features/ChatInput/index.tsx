import DesktopChatInput from '@/features/ChatInput/Desktop';
import MobileChatInput from '@/features/ChatInput/Mobile';
import { isMobileDevice } from '@/utils/server/responsive';

const ChatInput = () => {
  const mobile = isMobileDevice();
  const Input = mobile ? MobileChatInput : DesktopChatInput;

  return <Input />;
};

export default ChatInput;
