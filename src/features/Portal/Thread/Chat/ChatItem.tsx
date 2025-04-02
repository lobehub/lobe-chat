import React, { memo, useMemo } from 'react';

import { ChatItem } from '@/features/Conversation';
import ActionsBar from '@/features/Conversation/components/ChatItem/ActionsBar';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import ThreadDivider from './ThreadDivider';

export interface ThreadChatItemProps {
  id: string;
  index: number;
}

const ThreadChatItem = memo<ThreadChatItemProps>(({ id, index }) => {
  const [threadMessageId, threadStartMessageIndex, historyLength] = useChatStore((s) => [
    threadSelectors.threadSourceMessageId(s),
    threadSelectors.threadSourceMessageIndex(s),
    threadSelectors.portalDisplayChatsLength(s),
  ]);

  const enableThreadDivider = threadMessageId === id;

  const endRender = useMemo(
    () => enableThreadDivider && <ThreadDivider />,
    [enableThreadDivider, id],
  );

  const isParentMessage = index <= threadStartMessageIndex;

  const actionBar = useMemo(
    () => !isParentMessage && <ActionsBar id={id} inPortalThread index={index} />,
    [id, isParentMessage],
  );

  const enableHistoryDivider = useAgentStore(
    agentChatConfigSelectors.enableHistoryDivider(historyLength, index),
  );

  return (
    <ChatItem
      actionBar={actionBar}
      disableEditing={isParentMessage}
      enableHistoryDivider={enableHistoryDivider}
      endRender={endRender}
      id={id}
      inPortalThread
      index={index}
    />
  );
});

ThreadChatItem.displayName = 'ThreadChatItem';

export default ThreadChatItem;
