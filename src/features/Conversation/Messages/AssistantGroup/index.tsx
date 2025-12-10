'use client';

import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatItem } from '@/features/Conversation/ChatItem';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';

import { useAgentMeta } from '../../hooks';
import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import Usage from '../components/Extras/Usage';
import { GroupActionsBar } from './Actions';
import EditState from './EditState';
import Group from './Group';

interface GroupMessageProps {
  disableEditing?: boolean;
  id: string;
  index: number;
  isLatestItem?: boolean;
}

const GroupMessage = memo<GroupMessageProps>(({ id, index, disableEditing, isLatestItem }) => {
  // Get message and actionsConfig from ConversationStore
  const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;
  const actionsConfig = useConversationStore(
    (s) => s.actionsBar?.assistantGroup ?? s.actionsBar?.assistant,
  );

  const { usage, createdAt, children, performance, model, provider } = item;
  const avatar = useAgentMeta();

  const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
  const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
  const openChatSettings = useOpenChatSettings();

  // Get the latest message block from the group that doesn't contain tools
  const lastAssistantMsg = useConversationStore(
    dataSelectors.getGroupLatestMessageWithoutTools(id),
  );

  const contentId = lastAssistantMsg?.id;

  // Get editing state from ConversationStore
  const isEditing = useConversationStore(messageStateSelectors.isMessageEditing(contentId || ''));

  const onAvatarClick = useCallback(() => {
    if (!isInbox) {
      toggleSystemRole(true);
    } else {
      openChatSettings();
    }
  }, [isInbox]);

  // If editing, show edit state
  if (isEditing && contentId) {
    return <EditState content={lastAssistantMsg?.content} id={contentId} />;
  }

  return (
    <ChatItem
      actions={
        !disableEditing && (
          <GroupActionsBar
            actionsConfig={actionsConfig}
            contentBlock={lastAssistantMsg}
            contentId={contentId}
            data={item}
            id={id}
          />
        )
      }
      avatar={avatar}
      onAvatarClick={onAvatarClick}
      placement={'left'}
      renderMessage={() => (
        <Flexbox gap={8} width={'100%'}>
          {children && children.length > 0 && (
            <Group
              blocks={children}
              content={lastAssistantMsg?.content}
              contentId={contentId}
              disableEditing={disableEditing}
              id={id}
              messageIndex={index}
            />
          )}

          {model && (
            <Usage model={model} performance={performance} provider={provider!} usage={usage} />
          )}
        </Flexbox>
      )}
      showTitle
      style={isLatestItem ? { minHeight: 'calc(-300px + 100dvh)' } : undefined}
      time={createdAt}
    />
  );
}, isEqual);

export default GroupMessage;
