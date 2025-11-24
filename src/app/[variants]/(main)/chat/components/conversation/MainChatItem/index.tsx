import { createStyles } from 'antd-style';
import React, { memo } from 'react';

import {
  MessageItem,
  conversationSelectors,
  useConversationStore,
} from '@/features/Conversation';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

import SupervisorThinkingTag from './OrchestratorThinking';
import Thread from './Thread';

const useStyles = createStyles(({ css, token, isDarkMode }) => {
  const borderColor = isDarkMode ? token.colorFillSecondary : token.colorFillTertiary;

  return {
    end: css`
      &::after {
        inset-inline-end: 36px;
        border-inline-end: 2px solid ${borderColor};
        border-end-end-radius: 8px;
      }
    `,
    line: css`
      &::after {
        content: '';

        position: absolute;
        inset-block-end: 60px;

        width: 38px;
        height: 53px;
        border-block-end: 2px solid ${borderColor};
      }
    `,
    start: css`
      &::after {
        inset-inline-start: 30px;
        border-inline-start: 2px solid ${borderColor};
        border-end-start-radius: 8px;
      }
    `,
  };
});

export interface ThreadChatItemProps {
  id: string;
  index: number;
}

const MainChatItem = memo<ThreadChatItemProps>(({ id, index }) => {
  const { styles, cx } = useStyles();

  const [showThread, historyLength] = useConversationStore((s) => [
    conversationSelectors.hasThreadBySourceMsgId(id)(s),
    conversationSelectors.displayMessageIds(s).length,
  ]);

  const [displayMode, enableHistoryDivider] = useAgentStore((s) => [
    agentChatConfigSelectors.displayMode(s),
    agentChatConfigSelectors.enableHistoryDivider(historyLength, index)(s),
  ]);

  const userRole = useConversationStore(
    (s) => conversationSelectors.getDisplayMessageById(id)(s)?.role,
  );

  const placement = displayMode === 'chat' && userRole === 'user' ? 'end' : 'start';

  const isLatestItem = historyLength === index + 1;

  return (
    <>
      <MessageItem
        className={showThread ? cx(styles.line, styles[placement]) : ''}
        enableHistoryDivider={enableHistoryDivider}
        endRender={showThread && <Thread id={id} placement={placement} />}
        id={id}
        index={index}
        isLatestItem={isLatestItem}
      />
      {isLatestItem && <SupervisorThinkingTag />}
    </>
  );
});

export default MainChatItem;
