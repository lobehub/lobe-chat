import { type AlertProps, ChatItem } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';

import { renderErrorMessages } from '../../Error';
import { renderMessagesExtra } from '../../Extras';
import { renderMessages, useAvatarsClick } from '../../Messages';
import ActionsBar from './ActionsBar';
import HistoryDivider from './HistoryDivider';

const useStyles = createStyles(({ css, prefixCls }) => ({
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
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const [editing, setEditing] = useState(false);
  const [type = 'chat'] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.displayMode];
  });

  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const item = useChatStore((s) => {
    const chats = chatSelectors.currentChatsWithGuideMessage(meta)(s);

    if (index >= chats.length) return;

    return chatSelectors.currentChatsWithGuideMessage(meta)(s)[index];
  }, isEqual);

  const historyLength = useChatStore((s) => chatSelectors.currentChats(s).length);

  const [loading, onMessageChange] = useChatStore((s) => [
    s.chatLoadingId === id,
    s.updateMessageContent,
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

  const ErrorMessage = useCallback(
    ({ data }: { data: ChatMessage }) => {
      if (!renderErrorMessages || !item?.error?.type) return;
      let RenderFunction;
      if (renderErrorMessages?.[item.error.type])
        RenderFunction = renderErrorMessages[item.error.type].Render;
      if (!RenderFunction && renderErrorMessages?.['default'])
        RenderFunction = renderErrorMessages['default'].Render;
      if (!RenderFunction) return;
      return <RenderFunction {...data} />;
    },
    [item?.error],
  );

  const error = useMemo(() => {
    if (!item?.error) return;
    const message = item.error?.message;
    let alertConfig = {};
    if (item.error.type && renderErrorMessages?.[item.error.type]) {
      alertConfig = renderErrorMessages[item.error.type]?.config as AlertProps;
    }
    return { message, ...alertConfig };
  }, [item?.error]);

  const enableHistoryDivider = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
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
          actions={<ActionsBar index={index} setEditing={setEditing} />}
          avatar={item.meta}
          className={styles.message}
          editing={editing}
          error={error}
          errorMessage={<ErrorMessage data={item} />}
          loading={loading}
          message={item.content}
          messageExtra={<MessageExtra data={item} />}
          onAvatarClick={onAvatarsClick?.(item.role)}
          onChange={(value) => onMessageChange(item.id, value)}
          onDoubleClick={(e) => {
            if (item.id === 'default' || item.error) return;
            if (item.role && ['assistant', 'user'].includes(item.role) && e.altKey) {
              setEditing(true);
            }
          }}
          onEditingChange={setEditing}
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
