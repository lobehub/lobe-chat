import { MarkdownProps } from '@lobehub/ui';
import { EditableMessage } from '@lobehub/ui/chat';
import { type ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MessageContentClassName } from '@/features/Conversation/Messages/Default';
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { useStyles } from '../style';
import { ChatItemProps } from '../type';

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
    const { t } = useTranslation('common');
    const { cx, styles } = useStyles({ disabled, editing, placement });
    const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
    const text = useMemo(
      () => ({
        cancel: t('cancel'),
        confirm: t('ok'),
        edit: t('edit'),
      }),
      [],
    );

    const [toggleMessageEditing, updateMessageContent] = useChatStore((s) => [
      s.toggleMessageEditing,
      s.modifyMessageContent,
    ]);
    const onChange = (value: string) => {
      updateMessageContent(id, value);
    };
    const onEditingChange = (edit: boolean) => toggleMessageEditing(id, edit);

    const content = (
      <EditableMessage
        classNames={{ input: styles.editingInput }}
        editButtonSize={'small'}
        editing={editing}
        fontSize={fontSize}
        fullFeaturedCodeBlock
        markdownProps={markdownProps}
        onChange={onChange}
        onEditingChange={onEditingChange}
        text={text}
        value={message ? String(message) : ''}
      />
    );
    const messageContent = renderMessage ? renderMessage(content) : content;

    return (
      <Flexbox
        className={cx(
          styles.message,
          className,
          editing && styles.editingContainer,
          MessageContentClassName,
        )}
        onDoubleClick={onDoubleClick}
      >
        {messageContent}
        {messageExtra && !editing ? (
          <div className={styles.messageExtra}>{messageExtra}</div>
        ) : null}
      </Flexbox>
    );
  },
);

export default MessageContent;
