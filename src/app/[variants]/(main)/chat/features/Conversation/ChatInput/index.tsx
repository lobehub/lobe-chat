import DesktopChatInput from './Desktop';

interface ChatInputProps {
  targetMemberId?: string;
}

const ChatInput = ({ targetMemberId }: ChatInputProps) => {
  return <DesktopChatInput targetMemberId={targetMemberId} />;
};

export default ChatInput;
