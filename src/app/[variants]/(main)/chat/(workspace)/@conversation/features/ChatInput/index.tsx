import DesktopChatInput from './Desktop';
import MobileChatInput from './V1Mobile';

const ChatInput = ({ mobile }: { mobile: boolean }) => {
  const Input = mobile ? MobileChatInput : DesktopChatInput;

  return <Input />;
};

export default ChatInput;
