import { AlertProps, ChatItem } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';
import { ChatMessage } from '@/types/message';

import ErrorMessageExtra, { getErrorAlertConfig } from '../../Error';
import { renderMessagesExtra } from '../../Extras';
import { renderMessages, useAvatarsClick } from '../../Messages';
import ActionsBar from './ActionsBar';
import HistoryDivider from './HistoryDivider';

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
  id: string;
  index: number;
}

const Item = memo<ChatListItemProps>(({ index, id }) => {
  const fontSize = useUserStore((s) => settingsSelectors.currentSettings(s).fontSize);
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

    return chatSelectors.currentChatsWithGuideMessage(meta)(s)[index];
  }, isEqual);

  const historyLength = useChatStore((s) => chatSelectors.currentChats(s).length);

  const [isMessageLoading, generating, editing, toggleMessageEditing, updateMessageContent] =
    useChatStore((s) => [
      chatSelectors.isMessageLoading(id)(s),
      chatSelectors.isMessageGenerating(id)(s),
      chatSelectors.isMessageEditing(id)(s),
      s.toggleMessageEditing,
      s.modifyMessageContent,
    ]);

  const onAvatarsClick = useAvatarsClick();

  const RenderMessage = useCallback(
    ({ editableContent, data }: { data: ChatMessage; editableContent: ReactNode }) => {
      if (!item?.role) return;
      const RenderFunction = renderMessages[item.role] ?? renderMessages['default'];

      if (!RenderFunction) return;

      return <RenderFunction {...data} editableContent={editableContent} />;
    },
    [item?.role],
  );

  const MessageExtra = useCallback(
    ({ data }: { data: ChatMessage }) => {
      if (!renderMessagesExtra || !item?.role) return;
      let RenderFunction;
      if (renderMessagesExtra?.[item.role]) RenderFunction = renderMessagesExtra[item.role];

      if (!RenderFunction) return;
      return <RenderFunction {...data} />;
    },
    [item?.role],
  );

  const { t: errorT } = useTranslation('error');
  const error = useMemo<AlertProps | undefined>(() => {
    if (!item?.error) return;
    const messageError = item.error;

    const alertConfig = getErrorAlertConfig(messageError.type);

    return { message: errorT(`response.${messageError.type}` as any), ...alertConfig };
  }, [item?.error]);

  const enableHistoryDivider = useAgentStore((s) => {
    const config = agentSelectors.currentAgentChatConfig(s);
    return (
      config.enableHistoryCount &&
      historyLength > (config.historyCount ?? 0) &&
      config.historyCount === historyLength - index + 1
    );
  });

  return (
    item && (
      <>
        <HistoryDivider enable={enableHistoryDivider} />
        <ChatItem
          actions={
            <ActionsBar
              index={index}
              setEditing={(edit) => {
                toggleMessageEditing(id, edit);
              }}
            />
          }
          avatar={item.meta}
          className={cx(styles.message, isMessageLoading && styles.loading)}
          editing={editing}
          error={error}
          errorMessage={<ErrorMessageExtra data={item} />}
          fontSize={fontSize}
          loading={generating}
          message={item.content}
          messageExtra={<MessageExtra data={item} />}
          onAvatarClick={onAvatarsClick?.(item.role)}
          onChange={(value) => updateMessageContent(item.id, value)}
          onDoubleClick={(e) => {
            if (item.id === 'default' || item.error) return;
            if (item.role && ['assistant', 'user'].includes(item.role) && e.altKey) {
              toggleMessageEditing(id, true);
            }
          }}
          onEditingChange={(edit) => {
            toggleMessageEditing(id, edit);
          }}
          placement={type === 'chat' ? (item.role === 'user' ? 'right' : 'left') : 'left'}
          primary={item.role === 'user'}
          renderMessage={(editableContent) => (
            <RenderMessage data={item} editableContent={editableContent} />
          )}
          text={{
            cancel: t('cancel'),
            confirm: t('ok'),
            edit: t('edit'),
          }}
          time={item.updatedAt || item.createdAt}
          type={type === 'chat' ? 'block' : 'pure'}
        />
      </>
    )
  );
});

export default Item;
