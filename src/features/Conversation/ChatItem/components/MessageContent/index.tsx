import { Markdown, MarkdownProps } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { type ReactNode, Suspense, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useConversationStore } from '@/features/Conversation/store';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { useStyles } from '../../style';
import { ChatItemProps } from '../../type';

const EditableModal = dynamic(() => import('./EditableModal'), { ssr: false });

export const MSG_CONTENT_CLASSNAME = 'msg_content_flag';

export interface MessageContentProps {
  className?: string;
  disabled?: ChatItemProps['disabled'];
  editing?: ChatItemProps['editing'];
  id: string;
  markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
  message?: ReactNode;
  messageExtra?: ChatItemProps['messageExtra'];
  onDoubleClick?: ChatItemProps['onDoubleClick'];
  placement?: ChatItemProps['placement'];
  renderMessage?: ChatItemProps['renderMessage'];
  variant?: ChatItemProps['variant'];
}

const MessageContent = memo<MessageContentProps>(
  ({
    editing,
    id,
    message,
    placement,
    messageExtra,
    renderMessage,
    onDoubleClick,
    markdownProps,
    disabled,
    className,
  }) => {
    const { cx, styles } = useStyles({ disabled, placement });
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
      <Markdown fontSize={fontSize} {...markdownProps}>
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
          className={cx(MSG_CONTENT_CLASSNAME, styles.message, className)}
          onDoubleClick={onDoubleClick}
        >
          {messageContent}
          {messageExtra && <div className={styles.messageExtra}>{messageExtra}</div>}
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
