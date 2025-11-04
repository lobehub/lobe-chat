import { UIChatMessage } from '@lobechat/types';
import { memo, useMemo } from 'react';

import { LOADING_FLAT } from '@/_const/message';
import { useChat } from '@/hooks/useChat';

import MessageContextMenu from '../components/MessageContextMenu';
import AssistantMessage from './Assistant';
import SupervisorMessage from './Supervisor';
import UserMessage from './User';

export interface ChatMessageItemProps {
  index: number;
  item: UIChatMessage;
  totalLength: number;
}

/**
 * ChatMessageItem - 消息列表项容器
 *
 * 职责：
 * 1. 根据消息角色分发到对应的角色组件
 * 2. 提供 MessageContextMenu 上下文菜单支持
 * 3. 处理加载状态和 markdown 配置
 */
const ChatMessageItem = memo<ChatMessageItemProps>(({ item, index, totalLength }) => {
  const { isGenerating } = useChat();
  const isLastMessage = index === totalLength - 1;
  const isAssistant = item.role === 'assistant';
  const isLoadingContent = item.content === LOADING_FLAT;
  const hasError = !!item.error?.type;
  // 如果有错误，即使content是LOADING_FLAT也不应该显示为loading状态
  const shouldShowLoading = isLastMessage && isAssistant && isLoadingContent && !hasError;

  const commonProps = {
    index,
    isGenerating,
    isLastMessage,
    isLoading: shouldShowLoading,
    message: item,
    showActionsBar: isLastMessage,
    totalLength,
  };

  const renderContent = useMemo(() => {
    switch (item?.role) {
      case 'user': {
        return <UserMessage {...commonProps} />;
      }

      case 'assistant': {
        return <AssistantMessage {...commonProps} />;
      }

      case 'supervisor': {
        return <SupervisorMessage {...commonProps} />;
      }

      default: {
        return null;
      }
    }
  }, [item?.role, commonProps]);

  if (!item) return null;

  return (
    <MessageContextMenu
      borderRadius={false}
      gap={8}
      message={item}
      paddingBlock={8}
      paddingInline={16}
    >
      {renderContent}
    </MessageContextMenu>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

export { ChatMessageItem };
export default ChatMessageItem;
