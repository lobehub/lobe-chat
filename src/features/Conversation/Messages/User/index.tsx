import { ChatMessage } from '@lobechat/types';
import { useResponsive } from 'antd-style';
import { ReactNode, memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Avatar from '@/features/ChatItem/components/Avatar';
import BorderSpacing from '@/features/ChatItem/components/BorderSpacing';
import MessageContent from '@/features/ChatItem/components/MessageContent';
import Title from '@/features/ChatItem/components/Title';
import { useStyles } from '@/features/ChatItem/style';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import { useDoubleClickEdit } from '../../hooks/useDoubleClickEdit';
import { UserActionsBar } from './Actions';
import { UserBelowMessage } from './BelowMessage';
import { UserMessageExtra } from './Extra';
import { MarkdownRender as UserMarkdownRender } from './MarkdownRender';
import { UserMessageContent } from './MessageContent';

interface UserMessageProps extends ChatMessage {
  disableEditing?: boolean;
  index: number;
}

const UserMessage = memo<UserMessageProps>((props) => {
  const { id, ragQuery, content, createdAt, error, role, index, extra, disableEditing } = props;

  const { mobile } = useResponsive();
  const avatar = useUserAvatar();
  const title = useUserStore(userProfileSelectors.displayUserName);

  const displayMode = useAgentStore(agentChatConfigSelectors.displayMode);

  const [editing, generating, isInRAGFlow] = useChatStore((s) => [
    chatSelectors.isMessageEditing(id)(s),
    chatSelectors.isMessageGenerating(id)(s),
    chatSelectors.isMessageInRAGFlow(id)(s),
  ]);

  const loading = isInRAGFlow || generating;

  const placement = displayMode === 'chat' ? 'right' : 'left';
  const variant = displayMode === 'chat' ? 'bubble' : 'docs';

  const { styles } = useStyles({
    editing,
    placement,
    primary: true,
    showTitle: false,
    time: createdAt,
    title,
    variant,
  });

  const onDoubleClick = useDoubleClickEdit({ disableEditing, error, id, index, role });

  const renderMessage = useCallback(
    (editableContent: ReactNode) => (
      <UserMessageContent {...props} editableContent={editableContent} />
    ),
    [props],
  );

  const markdownProps = useMemo(
    () => ({
      customRender: (dom: ReactNode, { text }: { text: string }) => (
        <UserMarkdownRender displayMode={displayMode} dom={dom} id={id} text={text} />
      ),
    }),
    [displayMode],
  );

  return (
    <Flexbox
      className={styles.container}
      direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
      gap={mobile ? 6 : 12}
    >
      <Avatar
        alt={title}
        avatar={{ avatar, title }}
        loading={loading}
        placement={placement}
        size={mobile ? 32 : undefined}
        style={{ marginTop: 6 }}
      />
      <Flexbox
        align={placement === 'left' ? 'flex-start' : 'flex-end'}
        className={styles.messageContainer}
      >
        <Title
          avatar={{ avatar, title }}
          placement={placement}
          showTitle={false}
          time={createdAt}
        />
        <Flexbox
          align={placement === 'left' ? 'flex-start' : 'flex-end'}
          className={styles.messageContent}
          direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
          gap={8}
        >
          <Flexbox flex={1} style={{ minWidth: 0 }}>
            <MessageContent
              editing={editing}
              id={id}
              markdownProps={markdownProps}
              message={content}
              messageExtra={<UserMessageExtra content={content} extra={extra} id={id} />}
              onDoubleClick={onDoubleClick}
              placement={placement}
              primary
              renderMessage={renderMessage}
              variant={variant}
            />
          </Flexbox>

          {!disableEditing && !editing && (
            <Flexbox align={'flex-start'} className={styles.actions} role="menubar">
              <UserActionsBar data={props} id={id} index={index} />
            </Flexbox>
          )}
        </Flexbox>
        <UserBelowMessage content={content} id={id} ragQuery={ragQuery} />
      </Flexbox>
      {mobile && variant === 'bubble' && <BorderSpacing borderSpacing={32} />}
    </Flexbox>
  );
});

export default UserMessage;
