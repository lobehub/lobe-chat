import { Markdown, MarkdownProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { type ReactNode, Suspense, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useConversationStore } from '@/features/Conversation/store';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { ChatItemProps } from '../../type';

const EditableModal = dynamic(() => import('./EditableModal'), { ssr: false });

export const MSG_CONTENT_CLASSNAME = 'msg_content_flag';

export const useStyles = createStyles(({ css, token }) => {
  return {
    bubble: css`
      padding-block: 8px;
      padding-inline: 12px;
      border-radius: ${token.borderRadiusLG}px;
      background-color: ${token.colorFillTertiary};
    `,
    disabled: css`
      user-select: ${'none'};
      color: ${token.colorTextSecondary};
    `,
    message: css`
      position: relative;
      overflow: hidden;
      max-width: 100%;
    `,
  };
});

export interface MessageContentProps {
  className?: string;
  disabled?: ChatItemProps['disabled'];
  editing?: ChatItemProps['editing'];
  id: string;
  markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
  message?: ReactNode;
  messageExtra?: ChatItemProps['messageExtra'];
  onDoubleClick?: ChatItemProps['onDoubleClick'];
  renderMessage?: ChatItemProps['renderMessage'];
  variant?: ChatItemProps['variant'];
}

const MessageContent = memo<MessageContentProps>(
  ({
    editing,
    id,
    message,
    messageExtra,
    renderMessage,
    onDoubleClick,
    markdownProps,
    disabled,
    className,
    variant,
  }) => {
    const { cx, styles } = useStyles();
    const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
    const [toggleMessageEditing, updateMessageContent] = useConversationStore((s) => [
      s.toggleMessageEditing,
      s.updateMessageContent,
    ]);
    const onChange = (value: string) => {
      updateMessageContent(id, value);
    };
    const onEditingChange = (edit: boolean) => toggleMessageEditing(id, edit);

    const content = (
      <Markdown fontSize={fontSize} variant={'chat'} {...markdownProps}>
        {message ? String(message) : ''}
      </Markdown>
    );

    const messageContent = useMemo(
      () => (renderMessage ? renderMessage(content) : content),
      [renderMessage, content],
    );

    return (
      <>
        <Flexbox
          className={cx(
            MSG_CONTENT_CLASSNAME,
            styles.message,
            variant === 'bubble' && styles.bubble,
            disabled && styles.disabled,
            className,
          )}
          onDoubleClick={onDoubleClick}
        >
          {messageContent}
          {messageExtra && <div className={'message-extra'}>{messageExtra}</div>}
        </Flexbox>
        <Suspense fallback={null}>
          {editing && (
            <EditableModal
              editing={editing}
              onChange={onChange}
              onEditingChange={onEditingChange}
              value={message ? String(message) : ''}
            />
          )}
        </Suspense>
      </>
    );
  },
);

export default MessageContent;
