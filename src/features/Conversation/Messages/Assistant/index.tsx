'use client';

import { ChatMessage } from '@lobechat/types';
import { useResponsive } from 'antd-style';
import { ReactNode, memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { HtmlPreviewAction } from '@/components/HtmlPreview';
import { LOADING_FLAT } from '@/const/message';
import Avatar from '@/features/ChatItem/components/Avatar';
import BorderSpacing from '@/features/ChatItem/components/BorderSpacing';
import ErrorContent from '@/features/ChatItem/components/ErrorContent';
import MessageContent from '@/features/ChatItem/components/MessageContent';
import Title from '@/features/ChatItem/components/Title';
import { useStyles } from '@/features/ChatItem/style';
import ErrorMessageExtra, { useErrorContent } from '@/features/Conversation/Error';
import { markdownElements } from '@/features/Conversation/MarkdownElements';
import { AssistantActionsBar } from '@/features/Conversation/Messages/Assistant/Actions';
import { AssistantMessageExtra } from '@/features/Conversation/Messages/Assistant/Extra';
import { AssistantMessageContent } from '@/features/Conversation/Messages/Assistant/MessageContent';
import { useDoubleClickEdit } from '@/features/Conversation/hooks/useDoubleClickEdit';
import { normalizeThinkTags, processWithArtifact } from '@/features/Conversation/utils';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/slices/chat';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

const rehypePlugins = markdownElements.map((element) => element.rehypePlugin).filter(Boolean);
const remarkPlugins = markdownElements.map((element) => element.remarkPlugin).filter(Boolean);

const isHtmlCode = (content: string, language: string) => {
  return (
    language === 'html' ||
    (language === '' && content.includes('<html>')) ||
    (language === '' && content.includes('<!DOCTYPE html>'))
  );
};
const MOBILE_AVATAR_SIZE = 32;

interface AssistantMessageProps extends ChatMessage {
  disableEditing?: boolean;
  index: number;
  showTitle?: boolean;
}
const AssistantMessage = memo<AssistantMessageProps>((props) => {
  const {
    error,
    showTitle,
    id,
    role,
    search,
    disableEditing,
    index,
    content,
    createdAt,
    tools,
    extra,
    metadata,
    meta,
  } = props;
  const avatar = meta;
  const { mobile } = useResponsive();
  const placement = 'left';
  const type = useAgentStore(agentChatConfigSelectors.displayMode);
  const variant = type === 'chat' ? 'bubble' : 'docs';

  const { transitionMode, highlighterTheme, mermaidTheme } = useUserStore(
    userGeneralSettingsSelectors.config,
  );

  const [generating, isInRAGFlow, editing] = useChatStore((s) => [
    chatSelectors.isMessageGenerating(id)(s),
    chatSelectors.isMessageInRAGFlow(id)(s),
    chatSelectors.isMessageEditing(id)(s),
  ]);

  const { styles } = useStyles({
    editing,
    placement,
    primary: false,
    showTitle,
    time: createdAt,
    title: avatar.title,
    variant,
  });
  const errorContent = useErrorContent(error);

  // remove line breaks in artifact tag to make the ast transform easier
  const message = !editing ? normalizeThinkTags(processWithArtifact(content)) : content;

  // when the message is in RAG flow or the AI generating, it should be in loading state
  const loading = isInRAGFlow || generating;

  const animated = transitionMode === 'fadeIn' && generating;

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
          theme: highlighterTheme,
        },
        mermaid: { theme: mermaidTheme },
      },
      components,
      enableCustomFootnotes: true,
      rehypePlugins,
      remarkPlugins,
      showFootnotes:
        search?.citations &&
        // if the citations are all empty, we should not show the citations
        search?.citations.length > 0 &&
        // if the citations's url and title are all the same, we should not show the citations
        search?.citations.every((item) => item.title !== item.url),
    }),
    [animated, components, role, search, highlighterTheme, mermaidTheme],
  );

  const [isInbox] = useSessionStore((s) => [sessionSelectors.isInboxSession(s)]);
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
      <AssistantMessageContent {...props} editableContent={editableContent} />
    ),
    [props],
  );
  const errorMessage = <ErrorMessageExtra data={props} />;
  return (
    <Flexbox
      className={styles.container}
      direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
      gap={mobile ? 6 : 12}
    >
      <Avatar
        alt={avatar.title || 'avatar'}
        avatar={avatar}
        loading={loading}
        onClick={onAvatarClick}
        placement={placement}
        size={mobile ? MOBILE_AVATAR_SIZE : undefined}
        style={{ marginTop: 6 }}
      />
      <Flexbox align={'flex-start'} className={styles.messageContainer}>
        <Title avatar={avatar} placement={placement} showTitle={showTitle} time={createdAt} />
        <Flexbox
          align={'flex-start'}
          className={styles.messageContent}
          data-layout={'vertical'} // 添加数据属性以方便样式选择
          direction={'vertical'}
          gap={8}
        >
          <Flexbox style={{ flex: 1, maxWidth: '100%' }}>
            {error && (message === LOADING_FLAT || !message) ? (
              <ErrorContent error={errorContent} message={errorMessage} placement={placement} />
            ) : (
              <MessageContent
                editing={editing}
                id={id}
                markdownProps={markdownProps}
                message={message}
                messageExtra={
                  <>
                    {errorContent && (
                      <ErrorContent
                        error={errorContent}
                        message={errorMessage}
                        placement={placement}
                      />
                    )}
                    <AssistantMessageExtra
                      content={content}
                      extra={extra}
                      id={id}
                      metadata={metadata}
                      tools={tools}
                    />
                  </>
                }
                onDoubleClick={onDoubleClick}
                placement={placement}
                renderMessage={renderMessage}
                variant={variant}
              />
            )}
          </Flexbox>
          {!disableEditing && !editing && (
            <Flexbox align={'flex-start'} className={styles.actions} role="menubar">
              <AssistantActionsBar data={props} id={id} index={index} />
            </Flexbox>
          )}
        </Flexbox>
      </Flexbox>
      {mobile && <BorderSpacing borderSpacing={MOBILE_AVATAR_SIZE} />}
    </Flexbox>
  );
});

export default AssistantMessage;
