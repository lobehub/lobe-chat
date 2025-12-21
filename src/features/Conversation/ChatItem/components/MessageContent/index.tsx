import { Flexbox } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { type ReactNode, Suspense, memo, useCallback } from 'react';

import { useConversationStore } from '@/features/Conversation/store';

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
  children?: ReactNode;
  className?: string;
  disabled?: ChatItemProps['disabled'];
  editing?: ChatItemProps['editing'];
  id: string;
  message?: ReactNode;
  messageExtra?: ChatItemProps['messageExtra'];
  onDoubleClick?: ChatItemProps['onDoubleClick'];
  variant?: 'bubble' | 'default';
}

const MessageContent = memo<MessageContentProps>(
  ({
    editing,
    id,
    message,
    messageExtra,
    children,
    onDoubleClick,
    disabled,
    className,
    variant,
  }) => {
    const { cx, styles } = useStyles();
    const [toggleMessageEditing, updateMessageContent] = useConversationStore((s) => [
      s.toggleMessageEditing,
      s.updateMessageContent,
    ]);

    const onChange = useCallback(
      (value: string) => {
        updateMessageContent(id, value);
      },
      [id, updateMessageContent],
    );

    const onEditingChange = useCallback(
      (edit: boolean) => toggleMessageEditing(id, edit),
      [id, toggleMessageEditing],
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
          gap={16}
          onDoubleClick={onDoubleClick}
        >
          {children || message}
          {messageExtra}
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
