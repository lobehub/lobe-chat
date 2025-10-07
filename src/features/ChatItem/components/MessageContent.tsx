import { MarkdownProps } from '@lobehub/ui';
import { EditableMessage } from '@lobehub/ui/chat';
import { useResponsive } from 'antd-style';
import { type ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import { useStyles } from '../style';
import { ChatItemProps } from '../type';

export interface MessageContentProps {
  editing?: ChatItemProps['editing'];
  id: string;
  markdownProps?: Omit<MarkdownProps, 'className' | 'style' | 'children'>;
  message?: ReactNode;
  messageExtra?: ChatItemProps['messageExtra'];
  onChange?: ChatItemProps['onChange'];
  onDoubleClick?: ChatItemProps['onDoubleClick'];
  onEditingChange?: ChatItemProps['onEditingChange'];
  placement?: ChatItemProps['placement'];
  primary?: ChatItemProps['primary'];
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
    variant,
    primary,
    onDoubleClick,
    markdownProps,
  }) => {
    const { t } = useTranslation('common');
    const { cx, styles } = useStyles({ editing, placement, primary, variant });
    const fontSize = useUserStore(userGeneralSettingsSelectors.fontSize);
    const { mobile } = useResponsive();
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
        openModal={mobile ? editing : undefined}
        text={text}
        value={message ? String(message) : ''}
      />
    );
    const messageContent = renderMessage ? renderMessage(content) : content;

    return (
      <Flexbox
        className={cx(styles.message, editing && styles.editingContainer)}
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
