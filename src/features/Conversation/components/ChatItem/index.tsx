'use client';

import { ChatItem } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { MouseEventHandler, ReactNode, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
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
import ActionsBar from './ActionsBar';
import { processWithArtifact } from './utils';

const rehypePlugins = markdownElements.map((element) => element.rehypePlugin);

const useStyles = createStyles(({ css, prefixCls }) => ({
  loading: css`
    opacity: 0.6;
  `,
  message: css`
    // prevent the textarea too long
    .${prefixCls}-input {
      max-height: 900px;
    }
  `,
}));

export interface ChatListItemProps {
  hideActionBar?: boolean;
  id: string;
  index: number;
  showThreadDivider?: boolean;
}

const Item = memo<ChatListItemProps>(({ index, id, hideActionBar }) => {
  const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
  const { t } = useTranslation('common');
  const { styles, cx } = useStyles();
  const [type = 'chat'] = useAgentStore((s) => {
    const config = agentSelectors.currentAgentChatConfig(s);
    return [config.displayMode];
  });

  const meta = useSessionStore(sessionMetaSelectors.currentAgentMeta, isEqual);
  const item = useChatStore((s) => {
    const chats = chatSelectors.currentChatsWithGuideMessage(meta)(s);

    if (index >= chats.length) return;

    return chats.find((s) => s.id === id);
  }, isEqual);

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

  // when the message is in RAG flow or the AI generating, it should be in loading state
  const isProcessing = isInRAGFlow || generating;

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

  const [historyLength] = useChatStore((s) => [chatSelectors.currentChats(s).length]);

  const enableHistoryDivider = useAgentStore((s) => {
    const config = agentSelectors.currentAgentChatConfig(s);
    return (
      config.enableHistoryCount &&
      historyLength > (config.historyCount ?? 0) &&
      config.historyCount === historyLength - index
    );
  });

  // remove line breaks in artifact tag to make the ast transform easier
  const message =
    !editing && item?.role === 'assistant' ? processWithArtifact(item?.content) : item?.content;

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
      components,
      customRender: markdownCustomRender,
      rehypePlugins,
    }),
    [components, markdownCustomRender],
  );

  const onChange = useCallback((value: string) => updateMessageContent(id, value), [id]);

  const onDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (e) => {
      if (!item) return;
      if (item.id === 'default' || item.error) return;
      if (item.role && ['assistant', 'user'].includes(item.role) && e.altKey) {
        toggleMessageEditing(id, true);
      }
    },
    [item],
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

  const actions = useMemo(
    () =>
      !hideActionBar && (
        <ActionsBar
          index={index}
          setEditing={(edit) => {
            toggleMessageEditing(id, edit);
          }}
        />
      ),
    [hideActionBar, index, id],
  );

  const belowMessage = useMemo(() => item && <BelowMessage data={item} />, [item]);
  const errorMessage = useMemo(() => item && <ErrorMessageExtra data={item} />, [item]);
  const messageExtra = useMemo(() => item && <MessageExtra data={item} />, [item]);

  return (
    item && (
      <>
        {enableHistoryDivider && <History />}
        <ChatItem
          actions={actions}
          avatar={item.meta}
          belowMessage={belowMessage}
          className={cx(styles.message, isMessageLoading && styles.loading)}
          editing={editing}
          error={error}
          errorMessage={errorMessage}
          fontSize={fontSize}
          loading={isProcessing}
          markdownProps={markdownProps}
          message={message}
          messageExtra={messageExtra}
          onAvatarClick={onAvatarsClick}
          onChange={onChange}
          onDoubleClick={onDoubleClick}
          onEditingChange={onEditingChange}
          placement={type === 'chat' ? (item.role === 'user' ? 'right' : 'left') : 'left'}
          primary={item.role === 'user'}
          renderMessage={renderMessage}
          text={text}
          time={item.updatedAt || item.createdAt}
          type={type === 'chat' ? 'block' : 'pure'}
        />
      </>
    )
  );
});

Item.displayName = 'ChatItem';

export default Item;
