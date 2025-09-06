import DesktopChatInput from './Desktop';
import MobileChatInput from './Mobile';

interface ChatInputProps {
  mobile: boolean;
  targetMemberId?: string;
}

const ChatInput = ({ mobile, targetMemberId }: ChatInputProps) => {
  const Input = mobile ? MobileChatInput : DesktopChatInput;

  return <Input targetMemberId={targetMemberId} />;
};

export default ChatInput;
