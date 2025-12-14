'use client';

import { UIChatMessage } from '@lobechat/types';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { dataSelectors, useConversationStore } from '../../store';
import CouncilMember from './CouncilMember';

const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    width: calc(100% + 32px);
    margin-inline: -16px;
    padding-inline: 16px;
  `,
  scrollContainer: css`
    scroll-behavior: smooth;
    scrollbar-color: ${token.colorBorderSecondary} transparent;
    scrollbar-width: thin;
    scroll-snap-type: x mandatory;

    overflow-x: auto;
    display: flex;
    gap: ${token.paddingMD}px;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background: ${token.colorBorderSecondary};

      &:hover {
        background: ${token.colorBorder};
      }
    }

    // 移动端隐藏滚动条但保留功能
    ${responsive.mobile} {
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  `,
}));

interface AgentCouncilMessageProps {
  id: string;
  index: number;
  isLatestItem?: boolean;
}

/**
 * AgentCouncilMessage - Renders multiple agent responses in horizontal scroll layout
 *
 * Unlike CompareMessage, AgentCouncil:
 * - Has no active column selection (all members enter LLM context)
 * - Shows all agent responses side by side with horizontal scroll
 * - Used for broadcast scenario in multi-agent chat
 */
const AgentCouncilMessage = memo<AgentCouncilMessageProps>(({ id }) => {
  const { styles } = useStyles();

  // Get the agentCouncil virtual message from store
  const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;

  // members is a flat array of messages (each member is a single message)
  const members = (item as UIChatMessage)?.members as UIChatMessage[] | undefined;

  if (!members || members.length === 0) {
    return null;
  }

  return (
    <Flexbox className={styles.container}>
      <div className={styles.scrollContainer}>
        {members.map((member, memberIndex) => {
          if (!member) return null;

          return <CouncilMember index={memberIndex} key={member.id} message={member} />;
        })}
      </div>
    </Flexbox>
  );
}, isEqual);

export default AgentCouncilMessage;
