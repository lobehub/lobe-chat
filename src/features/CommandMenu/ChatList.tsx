import { memo } from 'react';

import type { ChatMessage } from './types';

interface ChatListProps {
  messages: ChatMessage[];
  styles: {
    chatContainer: string;
    chatMessage: string;
    chatMessageContent: string;
    chatMessageRole: string;
  };
}

const ChatList = memo<ChatListProps>(({ messages, styles }) => {
  return (
    <div className={styles.chatContainer}>
      {messages.map((message) => (
        <div className={styles.chatMessage} key={message.id}>
          <div className={styles.chatMessageRole}>{message.role}</div>
          <div className={styles.chatMessageContent}>{message.content}</div>
        </div>
      ))}
    </div>
  );
});

ChatList.displayName = 'ChatList';

export default ChatList;
