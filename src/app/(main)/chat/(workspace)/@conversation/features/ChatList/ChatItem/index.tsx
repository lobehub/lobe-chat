import React, { memo, useMemo } from 'react';

import { ChatItem } from '@/features/Conversation';
import ActionsBar from '@/features/Conversation/components/ChatItem/ActionsBar';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export interface ThreadChatItemProps {
  id: string;
  index: number;
}

const MainChatItem = memo<ThreadChatItemProps>(({ id, index }) => {
  const [historyLength] = useChatStore((s) => [chatSelectors.mainDisplayChatIDs(s).length]);

  const enableHistoryDivider = useAgentStore((s) => {
    const config = agentSelectors.currentAgentChatConfig(s);
    return (
      config.enableHistoryCount &&
      historyLength > (config.historyCount ?? 0) &&
      config.historyCount === historyLength - index
    );
  });

  const actionBar = useMemo(() => <ActionsBar id={id} />, [id]);

  return (
    <ChatItem
      actionBar={actionBar}
      enableHistoryDivider={enableHistoryDivider}
      id={id}
      index={index}
    />
  );
});

export default MainChatItem;
