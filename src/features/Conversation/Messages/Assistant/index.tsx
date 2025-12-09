'use client';

import { LOADING_FLAT } from '@lobechat/const';
import { Tag } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ReactNode, Suspense, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { HtmlPreviewAction } from '@/components/HtmlPreview';
import { ChatItem } from '@/features/Conversation/ChatItem';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { chatGroupSelectors, useChatGroupStore } from '@/store/chatGroup';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors, userProfileSelectors } from '@/store/user/selectors';

import ErrorMessageExtra, { useErrorContent } from '../../Error';
import { markdownElements } from '../../MarkdownElements';
import { useAgentMeta, useDoubleClickEdit } from '../../hooks';
import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import type { MessageActionsConfig } from '../../types';
import { normalizeThinkTags, processWithArtifact } from '../../utils/markdown';
import MessageBranch from '../components/MessageBranch';
import { AssistantActionsBar } from './Actions';
import { AssistantMessageExtra } from './Extra';
import { AssistantMessageBody } from './components/MessageBody';

const rehypePlugins = markdownElements.map((element) => element.rehypePlugin).filter(Boolean);
const remarkPlugins = markdownElements.map((element) => element.remarkPlugin).filter(Boolean);

const isHtmlCode = (content: string, language: string) => {
  return (
    language === 'html' ||
    (language === '' && content.includes('<html>')) ||
    (language === '' && content.includes('<!DOCTYPE html>'))
  );
};

interface AssistantMessageProps {
  actionsConfig?: MessageActionsConfig;
  disableEditing?: boolean;
  id: string;
  index: number;
  isLatestItem?: boolean;
}

const AssistantMessage = memo<AssistantMessageProps>(
  ({ actionsConfig, id, index, disableEditing, isLatestItem }) => {
    // Get message from ConversationStore instead of ChatStore
    const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;

    const {
      branch,
      error,
      role,
      search,
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

    const avatar = useAgentMeta();
    const { t } = useTranslation('chat');
    const placement = 'left';
    const variant = 'bubble';

    const { transitionMode, highlighterTheme, mermaidTheme, fontSize } = useUserStore(
      userGeneralSettingsSelectors.config,
    );

    // Get editing and generating state from ConversationStore
    const editing = useConversationStore(messageStateSelectors.isMessageEditing(id));
    const generating = useConversationStore(messageStateSelectors.isMessageGenerating(id));

    const errorContent = useErrorContent(error);

    // remove line breaks in artifact tag to make the ast transform easier
    const message = !editing ? normalizeThinkTags(processWithArtifact(content)) : content;

    // when the AI is generating, it should be in loading state
    const loading = generating;

    const animated = transitionMode === 'fadeIn' && generating;

    const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);
    const groupConfig = useChatGroupStore(chatGroupSelectors.currentGroupConfig);

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

    // ======================= Performance Optimization ======================= //
    // these useMemo/useCallback are all for the performance optimization
    // maybe we can remove it in React 19
    // ======================================================================== //

    const components = useMemo(
      () =>
        Object.fromEntries(
          markdownElements.map((element) => {
            const Component = element.Component;

            return [element.tag, (props: any) => <Component {...props} id={id} />];
          }),
        ),
      [id],
    );

    const markdownProps = useMemo(
      () => ({
        animated,
        citations: search?.citations,
        componentProps: {
          highlight: {
            actionsRender: ({ content, actionIconSize, language, originalNode }: any) => {
              const showHtmlPreview = isHtmlCode(content, language);
              return (
                <>
                  {showHtmlPreview && <HtmlPreviewAction content={content} size={actionIconSize} />}
                  {originalNode}
                </>
              );
            },
            fullFeatured: true,
            theme: highlighterTheme,
          },
          mermaid: { fullFeatured: false, theme: mermaidTheme },
        },
        components,
        enableCustomFootnotes: true,
        fontSize,
        rehypePlugins,
        remarkPlugins,
        showFootnotes:
          search?.citations &&
          // if the citations are all empty, we should not show the citations
          search?.citations.length > 0 &&
          // if the citations's url and title are all the same, we should not show the citations
          search?.citations.every((item) => item.title !== item.url),
      }),
      [animated, components, role, search, highlighterTheme, mermaidTheme, fontSize],
    );

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

    const onDoubleClick = useDoubleClickEdit({ disableEditing, error, id, index, role });

    const renderMessage = useCallback(
      (editableContent: ReactNode) => (
        <AssistantMessageBody
          {...item}
          editableContent={editableContent}
          markdownProps={markdownProps}
        />
      ),
      [item, markdownProps],
    );
    const errorMessage = <ErrorMessageExtra data={item} />;

    return (
      <Suspense fallback={<BubblesLoading />}>
        <ChatItem
          aboveMessage={null}
          actions={
            !disableEditing && !editing ? (
              <Flexbox align={'center'} horizontal role="menubar">
                {branch && (
                  <MessageBranch
                    activeBranchIndex={branch.activeBranchIndex}
                    count={branch.count}
                    messageId={id}
                  />
                )}
                <AssistantActionsBar
                  actionsConfig={actionsConfig}
                  data={item}
                  id={id}
                  index={index}
                />
              </Flexbox>
            ) : undefined
          }
          avatar={avatar}
          editing={editing}
          error={
            errorContent && error && (message === LOADING_FLAT || !message)
              ? errorContent
              : undefined
          }
          errorMessage={errorMessage}
          id={id}
          loading={loading}
          markdownProps={markdownProps}
          message={reducted ? `*${t('hideForYou')}*` : message}
          messageExtra={
            <>
              {errorContent && !(error && (message === LOADING_FLAT || !message)) && (
                <Flexbox
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    padding: 0,
                  }}
                >
                  {errorMessage}
                </Flexbox>
              )}
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
            </>
          }
          onAvatarClick={onAvatarClick}
          onDoubleClick={onDoubleClick}
          placement={placement}
          renderMessage={renderMessage}
          showTitle
          style={isLatestItem ? { minHeight: 'calc(-300px + 100dvh)' } : undefined}
          time={createdAt}
          titleAddon={dmIndicator}
          variant={variant}
        />
      </Suspense>
    );
  },
  isEqual,
);

AssistantMessage.displayName = 'AssistantMessage';

export default AssistantMessage;
