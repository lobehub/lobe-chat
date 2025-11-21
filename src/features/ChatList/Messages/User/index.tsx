import { UIChatMessage } from '@lobechat/types';
import { Tag } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Avatar from '@/features/ChatItem/components/Avatar';
import BorderSpacing from '@/features/ChatItem/components/BorderSpacing';
import MessageContent from '@/features/ChatItem/components/MessageContent';
import Title from '@/features/ChatItem/components/Title';
import { useStyles } from '@/features/ChatItem/style';
import { markdownElements } from '@/features/ChatList/MarkdownElements';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { displayMessageSelectors, messageStateSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import { useDoubleClickEdit } from '../../hooks/useDoubleClickEdit';
import Actions from './Actions';
import { UserBelowMessage } from './BelowMessage';
import { UserMessageExtra } from './Extra';
import { MarkdownRender as UserMarkdownRender } from './MarkdownRender';
import { UserMessageContent } from './MessageContent';

interface UserMessageProps {
  disableEditing?: boolean;
  id: string;
  index: number;
}

const rehypePlugins = markdownElements
  .filter((s) => s.scope !== 'assistant')
  .map((element) => element.rehypePlugin)
  .filter(Boolean);

const remarkPlugins = markdownElements
  .filter((s) => s.scope !== 'assistant')
  .map((element) => element.remarkPlugin)
  .filter(Boolean);

const UserMessage = memo<UserMessageProps>(({ id, disableEditing, index }) => {
  const item = useChatStore(
    displayMessageSelectors.getDisplayMessageById(id),
    isEqual,
  ) as UIChatMessage;

  const { ragQuery, content, createdAt, error, role, extra, targetId } = item;

  const { t } = useTranslation('chat');
  const { mobile } = useResponsive();
  const avatar = useUserAvatar();
  const title = useUserStore(userProfileSelectors.displayUserName);

  const displayMode = useAgentStore(agentChatConfigSelectors.displayMode);

  const [editing, creating, isInRAGFlow] = useChatStore((s) => [
    messageStateSelectors.isMessageEditing(id)(s),
    messageStateSelectors.isMessageCreating(id)(s), // User message only cares about creation (sendMessage)
    messageStateSelectors.isMessageInRAGFlow(id)(s),
  ]);

  const loading = isInRAGFlow || creating;

  // Get target name for DM indicator
  const userName = useUserStore(userProfileSelectors.nickName) || 'User';
  const agents = useSessionStore(sessionSelectors.currentGroupAgents);

  const dmIndicator = useMemo(() => {
    if (!targetId) return undefined;

    let targetName = targetId;
    if (targetId === 'user') {
      targetName = userName;
    } else {
      const targetAgent = agents?.find((agent) => agent.id === targetId);
      targetName = targetAgent?.title || targetId;
    }

    return <Tag>{t('dm.visibleTo', { target: targetName })}</Tag>;
  }, [targetId, userName, agents, t]);

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
      <UserMessageContent {...item} editableContent={editableContent} />
    ),
    [item],
  );

  const components = useMemo(
    () =>
      Object.fromEntries(
        markdownElements.map((element) => {
          const Component = element.Component;

          return [element.tag, (props: any) => <Component {...props} id={id} />];
        }),
      ),
    [id],
  );

  const markdownProps = useMemo(
    () => ({
      components,
      customRender: (dom: ReactNode, { text }: { text: string }) => (
        <UserMarkdownRender displayMode={displayMode} dom={dom} id={id} text={text} />
      ),
      rehypePlugins,
      remarkPlugins,
    }),
    [displayMode],
  );

  return (
    <Flexbox className={styles.container} gap={8}>
      <Flexbox
        direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
        gap={mobile ? 6 : 12}
      >
        <Avatar
          alt={title}
          avatar={{ avatar, title }}
          loading={loading}
          placement={placement}
          size={32}
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
            titleAddon={dmIndicator}
          />
          <Flexbox
            align={placement === 'left' ? 'flex-start' : 'flex-end'}
            className={styles.messageContent}
            direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
            gap={8}
          >
            <Flexbox flex={1} style={{ maxWidth: '100%', minWidth: 0 }}>
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
          </Flexbox>
          <UserBelowMessage content={content} id={id} ragQuery={ragQuery} />
        </Flexbox>
        {mobile && variant === 'bubble' && <BorderSpacing borderSpacing={32} />}
      </Flexbox>

      <Flexbox direction={'horizontal-reverse'}>
        <Actions data={item} disableEditing={disableEditing} id={id} index={index} />
      </Flexbox>
    </Flexbox>
  );
});

export default UserMessage;
