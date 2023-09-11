import { ReactNode, memo } from 'react';

interface ChatInputMobileLayoutProps {
  children: ReactNode;
  expand?: boolean;
}

const ChatInputMobileLayout = memo<ChatInputMobileLayoutProps>(({ children }) => {
  return <div>{children}</div>;
});

export default ChatInputMobileLayout;
