import MobileChatInput from '@/features/ChatInput/Mobile';

import DesktopChatInput from './Desktop';

const ChatInput = ({ mobile }: { mobile: boolean }) => {
  const Input = mobile ? MobileChatInput : DesktopChatInput;

  return <Input />;
};

export default ChatInput;
