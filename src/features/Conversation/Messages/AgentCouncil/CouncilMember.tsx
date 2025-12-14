'use client';

import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Avatar from '@/features/Conversation/ChatItem/components/Avatar';
import Title from '@/features/Conversation/ChatItem/components/Title';
import type { UIChatMessage } from '@/types/index';

import { useAgentMeta } from '../../hooks';
import { messageStateSelectors, useConversationStore } from '../../store';
import MessageContent from '../Assistant/components/MessageContent';
import Usage from '../components/Extras/Usage';
import type { DisplayMode } from './index';

const useStyles = createStyles(({ css, token, responsive }) => ({
  cardHorizontal: css`
    scroll-snap-align: start;

    overflow: hidden;
    flex: 0 0 auto;

    width: 480px;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};

    ${responsive.mobile} {
      width: 85vw;
      max-width: 360px;
    }
  `,
  // Tab mode: full width, no border
  cardTab: css`
    overflow: hidden;

    width: 100%;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
  `,
  // Vertical mode: full width with border
  cardVertical: css`
    overflow: hidden;

    width: 100%;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
  `,
  content: css`
    overflow: auto;
    flex: 1;
  `,
}));

interface CouncilMemberProps {
  index: number;
  message: UIChatMessage;
  mode?: DisplayMode;
}

/**
 * CouncilMember - Renders a single agent's response in the council grid
 *
 * Handles both:
 * - assistantGroup: Agent response with tool calls
 * - assistant: Simple agent response without tools
 */
const CouncilMember = memo<CouncilMemberProps>(({ message, mode = 'horizontal' }) => {
  const { styles, cx } = useStyles();

  const { agentId, performance, model, provider, usage, createdAt, id } = message;
  const avatar = useAgentMeta(agentId);

  const creating = useConversationStore(messageStateSelectors.isMessageCreating(id));

  const cardClassName = cx({
    [styles.cardHorizontal]: mode === 'horizontal',
    [styles.cardTab]: mode === 'tab',
    [styles.cardVertical]: mode === 'vertical',
  });

  return (
    <Flexbox className={cardClassName} gap={12}>
      <Flexbox align={'center'} gap={4} horizontal>
        <Avatar avatar={avatar} loading={creating} />
        <Title avatar={avatar} showTitle time={createdAt} />
      </Flexbox>

      <Flexbox className={styles.content} gap={8}>
        <MessageContent {...message} />
        {model && (
          <Usage model={model} performance={performance} provider={provider!} usage={usage} />
        )}
      </Flexbox>
    </Flexbox>
  );
}, isEqual);

CouncilMember.displayName = 'CouncilMember';

export default CouncilMember;
