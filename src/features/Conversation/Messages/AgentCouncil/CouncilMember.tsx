'use client';

import { ScrollShadow } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { LOADING_FLAT } from '@/const/message';
import { ChatItem } from '@/features/Conversation/ChatItem';
import ErrorMessageExtra, { useErrorContent } from '@/features/Conversation/Error';
import { actionBarHolder } from '@/features/Conversation/Messages/Assistant';
import { AssistantMessageExtra } from '@/features/Conversation/Messages/Assistant/Extra';
import { normalizeThinkTags, processWithArtifact } from '@/features/Conversation/utils/markdown';
import type { UIChatMessage } from '@/types/index';

import { useAgentMeta } from '../../hooks';
import { messageStateSelectors, useConversationStore } from '../../store';
import MessageContent from '../Assistant/components/MessageContent';

interface CouncilMemberProps {
  index: number;
  item: UIChatMessage;
  scrollShadow?: boolean;
}

const CouncilMember = memo<CouncilMemberProps>(({ scrollShadow, item }) => {
  const {
    id,
    agentId,
    error,
    content,
    createdAt,
    tools,
    extra,
    model,
    provider,
    performance,
    usage,
    metadata,
  } = item;
  const avatar = useAgentMeta(agentId);

  const editing = useConversationStore(messageStateSelectors.isMessageEditing(id));
  const generating = useConversationStore(messageStateSelectors.isMessageGenerating(id));
  const errorContent = useErrorContent(error);
  const message = !editing ? normalizeThinkTags(processWithArtifact(content)) : content;
  const contentNode = <MessageContent {...item} />;
  return (
    <ChatItem
      aboveMessage={null}
      actions={actionBarHolder}
      avatar={avatar}
      customErrorRender={(error) => <ErrorMessageExtra data={item} error={error} />}
      editing={editing}
      error={
        errorContent && error && (message === LOADING_FLAT || !message) ? errorContent : undefined
      }
      id={id}
      loading={generating}
      message={message}
      messageExtra={
        <AssistantMessageExtra
          content={content}
          extra={extra}
          id={id}
          model={model!}
          performance={performance! || metadata}
          provider={provider!}
          tools={tools}
          usage={usage! || metadata}
        />
      }
      placement={'left'}
      showTitle
      time={createdAt}
    >
      {scrollShadow ? (
        <ScrollShadow height={'max(33vh, 480px)'} hideScrollBar size={8}>
          {contentNode}
        </ScrollShadow>
      ) : (
        contentNode
      )}
    </ChatItem>
  );
}, isEqual);

CouncilMember.displayName = 'CouncilMember';

export default CouncilMember;
