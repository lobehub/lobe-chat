'use client';

import { LOADING_FLAT } from '@lobechat/const';
import { Tag } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatItem } from '@/features/Conversation/ChatItem';
import { useNewScreen } from '@/features/Conversation/Messages/components/useNewScreen';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { agentGroupSelectors, useAgentGroupStore } from '@/store/agentGroup';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import ErrorMessageExtra, { useErrorContent } from '../../Error';
import { useAgentMeta, useDoubleClickEdit } from '../../hooks';
import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import { normalizeThinkTags, processWithArtifact } from '../../utils/markdown';
import MessageBranch from '../components/MessageBranch';
import { AssistantActionsBar } from './Actions';
import { AssistantMessageExtra } from './Extra';
import MessageContent from './components/MessageContent';

interface AssistantMessageProps {
  disableEditing?: boolean;
  id: string;
  index: number;
  isLatestItem?: boolean;
}

const AssistantMessage = memo<AssistantMessageProps>(
  ({ id, index, disableEditing, isLatestItem }) => {
    // Get message and actionsConfig from ConversationStore
    const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;
    const actionsConfig = useConversationStore((s) => s.actionsBar?.assistant);

    const {
      agentId,
      branch,
      error,
      role,
      content,
      createdAt,
      tools,
      extra,
      model,
      provider,
      targetId,
      performance,
      usage,
      metadata,
    } = item;

    const avatar = useAgentMeta(agentId);
    const { t } = useTranslation('chat');

    // Get editing and generating state from ConversationStore
    const editing = useConversationStore(messageStateSelectors.isMessageEditing(id));
    const generating = useConversationStore(messageStateSelectors.isMessageGenerating(id));
    const creating = useConversationStore(messageStateSelectors.isMessageCreating(id));
    const newScreen = useNewScreen({ creating, isLatestItem });

    const errorContent = useErrorContent(error);

    // remove line breaks in artifact tag to make the ast transform easier
    const message = !editing ? normalizeThinkTags(processWithArtifact(content)) : content;

    const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);
    const groupConfig = useAgentGroupStore(agentGroupSelectors.currentGroupConfig);

    const reducted =
      isGroupSession && targetId !== null && targetId !== 'user' && !groupConfig?.revealDM;

    // Get target name for DM indicator
    const userName = useUserStore(userProfileSelectors.nickName) || 'User';
    const agents = useSessionStore(sessionSelectors.currentGroupAgents);

    const dmIndicator = useMemo(() => {
      if (!targetId) return undefined;

      let targetName = targetId;
      if (targetId === 'user') {
        targetName = t('dm.you');
      } else {
        const targetAgent = agents?.find((agent) => agent.id === targetId);
        targetName = targetAgent?.title || targetId;
      }

      return <Tag>{t('dm.visibleTo', { target: targetName })}</Tag>;
    }, [targetId, userName, agents, t]);

    const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
    const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
    const openChatSettings = useOpenChatSettings();

    const onAvatarClick = useCallback(() => {
      if (!isInbox) {
        toggleSystemRole(true);
      } else {
        openChatSettings();
      }
    }, [isInbox]);

    const onDoubleClick = useDoubleClickEdit({ disableEditing, error, id, role });

    return (
      <ChatItem
        aboveMessage={null}
        actions={
          <>
            {branch && (
              <MessageBranch
                activeBranchIndex={branch.activeBranchIndex}
                count={branch.count}
                messageId={id}
              />
            )}
            <AssistantActionsBar actionsConfig={actionsConfig} data={item} id={id} index={index} />
          </>
        }
        avatar={avatar}
        customErrorRender={() => <ErrorMessageExtra data={item} />}
        editing={editing}
        error={
          errorContent && error && (message === LOADING_FLAT || !message) ? errorContent : undefined
        }
        id={id}
        loading={generating}
        message={reducted ? `*${t('hideForYou')}*` : message}
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
        newScreen={newScreen}
        onAvatarClick={onAvatarClick}
        onDoubleClick={onDoubleClick}
        placement={'left'}
        showTitle
        time={createdAt}
        titleAddon={dmIndicator}
      >
        <MessageContent {...item} />
      </ChatItem>
    );
  },
  isEqual,
);

AssistantMessage.displayName = 'AssistantMessage';

export default AssistantMessage;
