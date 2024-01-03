import { type AlertProps, ChatItem, type ChatItemProps } from '@lobehub/ui';
import { ActionEvent, copyToClipboard } from '@lobehub/ui';
import { App } from 'antd';
import { FC, ReactNode, memo, useCallback, useMemo, useState } from 'react';

import { LLMRoleType } from '@/types/llm';
import { ChatMessage } from '@/types/message';

import ActionsBar, { type ActionsBarProps } from './ActionsBar';

export type OnMessageChange = (id: string, content: string) => void;
export type OnActionsClick = (action: ActionEvent, message: ChatMessage) => void;
export type OnAvatatsClick = (role: RenderRole) => ChatItemProps['onAvatarClick'];
export type RenderRole = LLMRoleType | 'default' | string;
export type RenderItem = FC<{ key: string } & ChatMessage & ListItemProps>;
export type RenderMessage = FC<ChatMessage & { editableContent: ReactNode }>;
export type RenderMessageExtra = FC<ChatMessage>;
export interface RenderErrorMessage {
  Render?: FC<ChatMessage>;
  config?: AlertProps;
}
export type RenderAction = FC<ActionsBarProps & ChatMessage>;

export interface ListItemProps {
  groupNav?: ChatItemProps['avatarAddon'];
  loading?: boolean;
  /**
   * @description 点击操作按钮的回调函数
   */
  onActionsClick?: OnActionsClick;
  onAvatarsClick?: OnAvatatsClick;
  /**
   * @description 消息变化的回调函数
   */
  onMessageChange?: OnMessageChange;
  renderActions?: {
    [actionKey: string]: RenderAction;
  };
  /**
   * @description 渲染错误消息的函数
   */
  renderErrorMessages?: {
    [errorType: 'default' | string]: RenderErrorMessage;
  };
  renderItems?: {
    [role: RenderRole]: RenderItem;
  };
  /**
   * @description 渲染消息的函数
   */
  renderMessages?: {
    [role: RenderRole]: RenderMessage;
  };
  /**
   * @description 渲染消息额外内容的函数
   */
  renderMessagesExtra?: {
    [role: RenderRole]: RenderMessageExtra;
  };
  /**
   * @description 是否显示聊天项的名称
   * @default false
   */
  showTitle?: boolean;
  /**
   * @description 文本内容
   */
  text?: ChatItemProps['text'] &
    ActionsBarProps['text'] & {
      copySuccess?: string;
      history?: string;
    } & {
      [key: string]: string;
    };
  /**
   * @description 聊天列表的类型
   * @default 'chat'
   */
  type?: 'docs' | 'chat';
}

export type ChatListItemProps = ChatMessage & ListItemProps;

const Item = memo<ChatListItemProps>((props) => {
  const {
    renderMessagesExtra,
    showTitle,
    onActionsClick,
    onAvatarsClick,
    onMessageChange,
    type,
    text,
    renderMessages,
    renderErrorMessages,
    renderActions,
    loading,
    groupNav,
    renderItems,
    ...item
  } = props;

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
      if (!renderMessages || !item?.role) return;
      let RenderFunction;
      if (renderMessages?.[item.role]) RenderFunction = renderMessages[item.role];
      if (!RenderFunction && renderMessages?.['default'])
        RenderFunction = renderMessages['default'];
      if (!RenderFunction) return;
      return <RenderFunction {...data} editableContent={editableContent} />;
    },
    [renderMessages?.[item.role]],
  );

  const MessageExtra = useCallback(
    ({ data }: { data: ChatMessage }) => {
      if (!renderMessagesExtra || !item?.role) return;
      let RenderFunction;
      if (renderMessagesExtra?.[item.role]) RenderFunction = renderMessagesExtra[item.role];
      if (renderMessagesExtra?.['default']) RenderFunction = renderMessagesExtra['default'];
      if (!RenderFunction) return;
      return <RenderFunction {...data} />;
    },
    [renderMessagesExtra?.[item.role]],
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
    [renderErrorMessages?.[item?.error?.type]],
  );

  const Actions = useCallback(
    ({ data }: { data: ChatMessage }) => {
      if (!renderActions || !item?.role) return;
      let RenderFunction;
      if (renderActions?.[item.role]) RenderFunction = renderActions[item.role];
      if (renderActions?.['default']) RenderFunction = renderActions['default'];
      if (!RenderFunction) RenderFunction = ActionsBar;

      const handleActionClick: ListItemProps['onActionsClick'] = async (action, data) => {
        switch (action.key) {
          case 'copy': {
            await copyToClipboard(data.content);
            message.success(text?.copySuccess || 'Copy Success');
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
          text={text}
        />
      );
    },
    [renderActions?.[item.role], text, onActionsClick],
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
      text={text}
      time={item.updateAt || item.createAt}
      type={type === 'chat' ? 'block' : 'pure'}
    />
  );
});

export default Item;
