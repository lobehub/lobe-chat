import { Tag } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatItem } from '@/features/Conversation/ChatItem';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors, userProfileSelectors } from '@/store/user/selectors';

import { markdownElements } from '../../MarkdownElements';
import { useDoubleClickEdit } from '../../hooks/useDoubleClickEdit';
import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import Actions from './Actions';
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
  const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;
  const actionsConfig = useConversationStore((s) => s.actionsBar?.user);

  const { content, createdAt, error, role, extra, targetId } = item;

  const { highlighterTheme, mermaidTheme, fontSize } = useUserStore(
    userGeneralSettingsSelectors.config,
  );

  const { t } = useTranslation('chat');
  const avatar = useUserAvatar();
  const title = useUserStore(userProfileSelectors.displayUserName);

  // Get editing and loading state from ConversationStore
  const editing = useConversationStore(messageStateSelectors.isMessageEditing(id));

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

  const placement = 'right';
  const variant = 'bubble';

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
      componentProps: {
        highlight: {
          fullFeatured: true,
          theme: highlighterTheme,
        },
        mermaid: { fullFeatured: false, theme: mermaidTheme },
      },
      components,
      customRender: (dom: ReactNode, { text }: { text: string }) => (
        <UserMarkdownRender dom={dom} id={id} text={text} />
      ),
      fontSize,
      rehypePlugins,
      remarkPlugins,
    }),
    [components, highlighterTheme, mermaidTheme, fontSize],
  );

  return (
    <ChatItem
      avatar={{ avatar, title }}
      belowMessage={
        <Flexbox direction={'horizontal-reverse'}>
          <Actions
            actionsConfig={actionsConfig}
            data={item}
            disableEditing={disableEditing}
            id={id}
            index={index}
          />
        </Flexbox>
      }
      editing={editing}
      id={id}
      markdownProps={markdownProps}
      message={content}
      messageExtra={<UserMessageExtra content={content} extra={extra} id={id} />}
      onDoubleClick={onDoubleClick}
      placement={placement}
      primary
      renderMessage={renderMessage}
      showAvatar={false}
      showTitle={false}
      time={createdAt}
      titleAddon={dmIndicator}
      variant={variant}
    />
  );
});

export default UserMessage;
