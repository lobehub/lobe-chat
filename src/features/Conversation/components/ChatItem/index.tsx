import { type AlertProps, ChatItem, type ChatItemProps } from '@lobehub/ui';
import { copyToClipboard } from '@lobehub/ui';
import { App } from 'antd';
import { FC, ReactNode, memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agent';
import { LLMRoleType } from '@/types/llm';
import { ChatMessage } from '@/types/message';

import { renderActions, useActionsClick } from '../../Actions';
import { renderErrorMessages } from '../../Error';
import { renderMessagesExtra } from '../../Extras';
import { renderMessages, useAvatarsClick } from '../../Messages';
import { OnActionsClick, OnAvatarsClick, OnMessageChange } from '../../types';
import ActionsBar from './ActionsBar';

export type RenderRole = LLMRoleType | 'default' | string;
export type RenderItem = FC<{ key: string } & ChatMessage & ListItemProps>;

export interface ListItemProps {
  groupNav?: ChatItemProps['avatarAddon'];
  loading?: boolean;
  /**
   * @description 点击操作按钮的回调函数
   */
  onActionsClick?: OnActionsClick;
  onAvatarsClick?: OnAvatarsClick;
  /**
   * @description 消息变化的回调函数
   */
  onMessageChange?: OnMessageChange;

  renderItems?: {
    [role: RenderRole]: RenderItem;
  };

  /**
   * @description 是否显示聊天项的名称
   * @default false
   */
  showTitle?: boolean;
}

export type ChatListItemProps = ChatMessage & ListItemProps;

const Item = memo<ChatListItemProps>((props) => {
  const { t } = useTranslation('common');

  const { showTitle, groupNav, renderItems, ...item } = props;

  const [loading, onMessageChange] = useChatStore((s) => [
    s.chatLoadingId === item.id,
    s.updateMessageContent,
  ]);
  const onActionsClick = useActionsClick();
  const onAvatarsClick = useAvatarsClick();

  const [type = 'chat'] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.displayMode];
  });

  const [editing, setEditing] = useState(false);

  const { message } = App.useApp();

  const RenderItem = useMemo(() => {
    if (!renderItems || !item?.role) return;
    let renderFunction;
    if (renderItems?.[item.role]) renderFunction = renderItems[item.role];
    if (!renderFunction && renderItems?.['default']) renderFunction = renderItems['default'];
    if (!renderFunction) return;
    return renderFunction;
  }, [renderItems?.[item.role]]);

  const RenderMessage = useCallback(
    ({ editableContent, data }: { data: ChatMessage; editableContent: ReactNode }) => {
      if (!item?.role) return;
      let RenderFunction;
      if (renderMessages?.[item.role]) RenderFunction = renderMessages[item.role];
      if (!RenderFunction && renderMessages?.['default'])
        RenderFunction = renderMessages['default'];
      if (!RenderFunction) return;
      return <RenderFunction {...data} editableContent={editableContent} />;
    },
    [],
  );

  const MessageExtra = useCallback(({ data }: { data: ChatMessage }) => {
    if (!renderMessagesExtra || !item?.role) return;
    let RenderFunction;
    if (renderMessagesExtra?.[item.role]) RenderFunction = renderMessagesExtra[item.role];
    if (renderMessagesExtra?.['default']) RenderFunction = renderMessagesExtra['default'];
    if (!RenderFunction) return;
    return <RenderFunction {...data} />;
  }, []);

  const ErrorMessage = useCallback(({ data }: { data: ChatMessage }) => {
    if (!renderErrorMessages || !item?.error?.type) return;
    let RenderFunction;
    if (renderErrorMessages?.[item.error.type])
      RenderFunction = renderErrorMessages[item.error.type].Render;
    if (!RenderFunction && renderErrorMessages?.['default'])
      RenderFunction = renderErrorMessages['default'].Render;
    if (!RenderFunction) return;
    return <RenderFunction {...data} />;
  }, []);

  const Actions = useCallback(
    ({ data }: { data: ChatMessage }) => {
      if (!renderActions || !item?.role) return;
      let RenderFunction;
      if (renderActions[item.role]) RenderFunction = renderActions[item.role];

      if (!RenderFunction) RenderFunction = ActionsBar;

      const handleActionClick: ListItemProps['onActionsClick'] = async (action, data) => {
        switch (action.key) {
          case 'copy': {
            await copyToClipboard(data.content);
            message.success(t('copySuccess', { defaultValue: 'Copy Success' }));
            break;
          }
          case 'edit': {
            setEditing(true);
          }
        }

        onActionsClick?.(action, data);
      };

      return (
        <RenderFunction
          {...data}
          onActionClick={(actionKey) => handleActionClick?.(actionKey, data)}
        />
      );
    },
    [onActionsClick],
  );

  const error = useMemo(() => {
    if (!item.error) return;
    const message = item.error?.message;
    let alertConfig = {};
    if (item.error.type && renderErrorMessages?.[item.error.type]) {
      alertConfig = renderErrorMessages[item.error.type]?.config as AlertProps;
    }
    return {
      message,
      ...alertConfig,
    };
  }, [renderErrorMessages, item.error]);

  if (RenderItem) return <RenderItem key={item.id} {...props} />;

  return (
    <ChatItem
      actions={<Actions data={item} />}
      avatar={item.meta}
      avatarAddon={groupNav}
      editing={editing}
      error={error}
      errorMessage={<ErrorMessage data={item} />}
      loading={loading}
      message={item.content}
      messageExtra={<MessageExtra data={item} />}
      onAvatarClick={onAvatarsClick?.(item.role)}
      onChange={(value) => onMessageChange?.(item.id, value)}
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
      showTitle={showTitle}
      text={{
        cancel: t('cancel'),
        confirm: t('ok'),
        edit: t('edit'),
      }}
      time={item.updatedAt || item.createdAt}
      type={type === 'chat' ? 'block' : 'pure'}
    />
  );
});

export default Item;
