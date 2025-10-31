import { UIChatMessage } from '@lobechat/types';
import { memo } from 'react';

import { LOADING_FLAT } from '@/_const/message';
import { useChat } from '@/hooks/useChat';

import ChatBubble from '../ChatBubble';

interface ChatMessageItemProps {
  index: number;
  item: UIChatMessage;
  totalLength: number;
}

const ChatMessageItem = memo<ChatMessageItemProps>(({ item, index, totalLength }) => {
  const { isGenerating } = useChat();
  const isLastMessage = index === totalLength - 1;
  const isAssistant = item.role === 'assistant';
  const isLoadingContent = item.content === LOADING_FLAT;
  const hasError = !!item.error?.type;
  // 如果有错误，即使content是LOADING_FLAT也不应该显示为loading状态
  const shouldShowLoading = isLastMessage && isAssistant && isLoadingContent && !hasError;

  return (
    <ChatBubble
      isLoading={shouldShowLoading}
      markdownProps={{
        enableStream: isLastMessage && isGenerating,
      }}
      message={item}
      showActionsBar={isLastMessage}
    />
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

export default ChatMessageItem;
