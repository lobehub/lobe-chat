'use client';

import isEqual from 'fast-deep-equal';
import { memo, useCallback, useMemo } from 'react';

import { ChatItem } from '@/features/Conversation/ChatItem';
import { useNewScreen } from '@/features/Conversation/Messages/components/useNewScreen';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';

import { useAgentMeta } from '../../hooks';
import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import FileListViewer from '../User/components/FileListViewer';
import Usage from '../components/Extras/Usage';
import { GroupActionsBar } from './Actions';
import EditState from './components/EditState';
import Group from './components/Group';

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

  const { agentId, usage, createdAt, children, performance, model, provider } = item;
  const avatar = useAgentMeta(agentId);

  // Collect fileList from all children blocks
  const aggregatedFileList = useMemo(() => {
    if (!children || children.length === 0) return [];
    return children.flatMap((child) => child.fileList || []);
  }, [children]);

  const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
  const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
  const openChatSettings = useOpenChatSettings();

  // Get the latest message block from the group that doesn't contain tools
  const lastAssistantMsg = useConversationStore(
    dataSelectors.getGroupLatestMessageWithoutTools(id),
  );

  const contentId = lastAssistantMsg?.id;

  // Get editing state from ConversationStore
  const editing = useConversationStore(messageStateSelectors.isMessageEditing(contentId || ''));
  const creating = useConversationStore(messageStateSelectors.isMessageCreating(id));
  const newScreen = useNewScreen({ creating, isLatestItem });

  const onAvatarClick = useCallback(() => {
    if (!isInbox) {
      toggleSystemRole(true);
    } else {
      openChatSettings();
    }
  }, [isInbox]);

  // If editing, show edit state
  if (editing && contentId) {
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
      newScreen={newScreen}
      onAvatarClick={onAvatarClick}
      placement={'left'}
      showTitle
      time={createdAt}
    >
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
      {aggregatedFileList.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <FileListViewer items={aggregatedFileList} />
        </div>
      )}
      {model && (
        <Usage model={model} performance={performance} provider={provider!} usage={usage} />
      )}
    </ChatItem>
  );
}, isEqual);

export default GroupMessage;
