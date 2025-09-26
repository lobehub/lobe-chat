'use client';

import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { MouseEventHandler, ReactNode, memo, use, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import DMTag from '@/components/DMTag';
import { isDesktop } from '@/const/version';
import ChatItem from '@/features/ChatItem';
import { VirtuosoContext } from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { chatGroupSelectors, useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';
import { ChatMessage } from '@/types/message';

import ErrorMessageExtra, { useErrorContent } from '../../Error';
import { renderMessagesExtra } from '../../Extras';
import {
  markdownCustomRenders,
  renderBelowMessages,
  renderMessages,
  useAvatarsClick,
} from '../../Messages';
import History from '../History';
import { markdownElements } from '../MarkdownElements';
import SupervisorMessage from '../SupervisorMessage';
import { InPortalThreadContext } from './InPortalThreadContext';
import { normalizeThinkTags, processWithArtifact } from './utils';

const assistantRehypePlugins = markdownElements
  .filter((element) => ['all', 'assistant'].includes(element.scope))
  .map((element) => element.rehypePlugin)
  .filter(Boolean);
const assistantRemarkPlugins = markdownElements
  .filter((element) => ['all', 'assistant'].includes(element.scope))
  .map((element) => element.remarkPlugin)
  .filter(Boolean);

const userRehypePlugins = markdownElements
  .filter((element) => ['all', 'user'].includes(element.scope))
  .map((element) => element.rehypePlugin)
  .filter(Boolean);
const userRemarkPlugins = markdownElements
  .filter((element) => ['all', 'user'].includes(element.scope))
  .map((element) => element.remarkPlugin)
  .filter(Boolean);

const useStyles = createStyles(({ css, prefixCls }) => ({
  loading: css`
    opacity: 0.6;
  `,
  message: css`
    position: relative;
    // prevent the textarea too long
    .${prefixCls}-input {
      max-height: 900px;
    }
  `,
}));

export interface ChatListItemProps {
  actionBar?: ReactNode;
  className?: string;
  disableEditing?: boolean;
  enableHistoryDivider?: boolean;
  endRender?: ReactNode;
  id: string;
  inPortalThread?: boolean;
  index: number;
  showAvatar?: boolean;
}

const Item = memo<ChatListItemProps>(
  ({
    className,
    enableHistoryDivider,
    id,
    actionBar,
    endRender,
    disableEditing,
    inPortalThread = false,
    index,
    showAvatar = true,
  }) => {
    const { t } = useTranslation('common');
    const { styles, cx } = useStyles();

    const type = useAgentStore(agentChatConfigSelectors.displayMode);
    const item = useChatStore(chatSelectors.getMessageById(id), isEqual);
    const transitionMode = useUserStore(userGeneralSettingsSelectors.transitionMode);

    const [
      isMessageLoading,
      generating,
      isInRAGFlow,
      editing,
      toggleMessageEditing,
      updateMessageContent,
    ] = useChatStore((s) => [
      chatSelectors.isMessageLoading(id)(s),
      chatSelectors.isMessageGenerating(id)(s),
      chatSelectors.isMessageInRAGFlow(id)(s),
      chatSelectors.isMessageEditing(id)(s),
      s.toggleMessageEditing,
      s.modifyMessageContent,
    ]);

    const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

    // when the message is in RAG flow or the AI generating, it should be in loading state
    const isProcessing = isInRAGFlow || generating;
    const animated = transitionMode === 'fadeIn' && generating;

    const onAvatarsClick = useAvatarsClick(item?.role);

    const renderMessage = useCallback(
      (editableContent: ReactNode) => {
        if (!item?.role) return;
        const RenderFunction = renderMessages[item.role] ?? renderMessages['default'];

        if (!RenderFunction) return;

        return <RenderFunction {...item} editableContent={editableContent} />;
      },
      [item],
    );

    const BelowMessage = useCallback(
      ({ data }: { data: ChatMessage }) => {
        if (!item?.role) return;
        const RenderFunction = renderBelowMessages[item.role] ?? renderBelowMessages['default'];

        if (!RenderFunction) return;

        return <RenderFunction {...data} />;
      },
      [item?.role],
    );

    const MessageExtra = useCallback(
      ({ data }: { data: ChatMessage }) => {
        if (!item?.role) return;
        let RenderFunction;
        if (renderMessagesExtra?.[item.role]) RenderFunction = renderMessagesExtra[item.role];

        if (!RenderFunction) return;
        return <RenderFunction {...data} />;
      },
      [item?.role],
    );

    const markdownCustomRender = useCallback(
      (dom: ReactNode, { text }: { text: string }) => {
        if (!item?.role) return dom;
        let RenderFunction;

        if (renderMessagesExtra?.[item.role]) RenderFunction = markdownCustomRenders[item.role];
        if (!RenderFunction) return dom;

        return <RenderFunction displayMode={type} dom={dom} id={id} text={text} />;
      },
      [item?.role, type],
    );

    const error = useErrorContent(item?.error);

    // remove line breaks in artifact tag to make the ast transform easier
    const message =
      !editing && item?.role === 'assistant'
        ? normalizeThinkTags(processWithArtifact(item?.content))
        : item?.content;

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
        citations: item?.role === 'user' ? undefined : item?.search?.citations,
        components,
        customRender: markdownCustomRender,
        enableCustomFootnotes: item?.role === 'assistant',
        rehypePlugins: item?.role === 'user' ? userRehypePlugins : assistantRehypePlugins,
        remarkPlugins: item?.role === 'user' ? userRemarkPlugins : assistantRemarkPlugins,
        showFootnotes:
          item?.role === 'user'
            ? undefined
            : item?.search?.citations &&
              // if the citations are all empty, we should not show the citations
              item?.search?.citations.length > 0 &&
              // if the citations's url and title are all the same, we should not show the citations
              item?.search?.citations.every((item) => item.title !== item.url),
      }),
      [animated, components, markdownCustomRender, item?.role, item?.search],
    );

    const onChange = useCallback((value: string) => updateMessageContent(id, value), [id]);
    const virtuosoRef = use(VirtuosoContext);

    const onDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
      (e) => {
        if (!item || disableEditing) return;
        if (item.id === 'default' || item.error) return;
        if (item.role && ['assistant', 'user'].includes(item.role) && e.altKey) {
          toggleMessageEditing(id, true);

          virtuosoRef?.current?.scrollIntoView({ align: 'start', behavior: 'auto', index });
        }
      },
      [item, disableEditing],
    );

    const text = useMemo(
      () => ({
        cancel: t('cancel'),
        confirm: t('ok'),
        edit: t('edit'),
      }),
      [t],
    );

    const onEditingChange = useCallback((edit: boolean) => {
      toggleMessageEditing(id, edit);
    }, []);

    const onContextMenu = useCallback(async () => {
      if (isDesktop && item) {
        const { electronSystemService } = await import('@/services/electron/system');

        electronSystemService.showContextMenu('chat', {
          content: item.content,
          hasError: !!item.error,
          messageId: id,
          role: item.role,
        });
      }
    }, [id, item]);

    const belowMessage = useMemo(() => item && <BelowMessage data={item} />, [item]);
    const errorMessage = useMemo(() => item && <ErrorMessageExtra data={item} />, [item]);
    const messageExtra = useMemo(() => item && <MessageExtra data={item} />, [item]);

    // DM tag logic - show for assistant messages with targetId when not in thread panel
    const isDM =
      !!item?.targetId && !inPortalThread && (item?.role === 'assistant' || item?.role === 'user');

    const isToCurrentUser = item?.targetId === 'user';

    const groupConfig = useChatGroupStore(chatGroupSelectors.currentGroupConfig);

    const revealDMContent = groupConfig?.revealDM;

    if (isDM && item?.role === 'user') return null;

    if (item?.role === 'supervisor') {
      return (
        <InPortalThreadContext.Provider value={inPortalThread}>
          <SupervisorMessage message={item} />
          {endRender}
        </InPortalThreadContext.Provider>
      );
    }

    return (
      item && (
        <InPortalThreadContext.Provider value={inPortalThread}>
          {enableHistoryDivider && <History />}
          <Flexbox
            className={cx(styles.message, className, isMessageLoading && styles.loading)}
            onContextMenu={onContextMenu}
          >
            <ChatItem
              actions={actionBar}
              avatar={item.meta}
              belowMessage={belowMessage}
              disabled={isDM && !isToCurrentUser && !revealDMContent}
              editing={editing}
              error={error}
              errorMessage={errorMessage}
              loading={isProcessing}
              markdownProps={markdownProps}
              message={
                isDM && !isToCurrentUser && !revealDMContent
                  ? `*${t('hideForYou', { ns: 'chat' })}*`
                  : message
              }
              messageExtra={messageExtra}
              onAvatarClick={onAvatarsClick}
              onChange={onChange}
              onDoubleClick={onDoubleClick}
              onEditingChange={onEditingChange}
              placement={type === 'chat' ? (item.role === 'user' ? 'right' : 'left') : 'left'}
              primary={item.role === 'user'}
              renderMessage={renderMessage}
              showAvatar={showAvatar}
              showTitle={isGroupSession && item.role !== 'user' && !inPortalThread}
              text={text}
              time={item.updatedAt || item.createdAt}
              titleAddon={
                isDM && <DMTag senderId={item.agentId} targetId={item.targetId ?? undefined} />
              }
              variant={type === 'chat' ? 'bubble' : 'docs'}
            />
            {endRender}
          </Flexbox>
        </InPortalThreadContext.Provider>
      )
    );
  },
);

Item.displayName = 'ChatItem';

export default Item;
