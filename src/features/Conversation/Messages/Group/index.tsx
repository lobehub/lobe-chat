'use client';

import { UIChatMessage } from '@lobechat/types';
import { useResponsive } from 'antd-style';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import Avatar from '@/features/ChatItem/components/Avatar';
import BorderSpacing from '@/features/ChatItem/components/BorderSpacing';
import Title from '@/features/ChatItem/components/Title';
import { useStyles } from '@/features/ChatItem/style';
import GroupChildren from '@/features/Conversation/Messages/Group/GroupChildren';
import Usage from '@/features/Conversation/components/Extras/Usage';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors, messageStateSelectors } from '@/store/chat/slices/message/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { GroupActionsBar } from './Actions';
import EditState from './EditState';

const MOBILE_AVATAR_SIZE = 32;

interface GroupMessageProps extends UIChatMessage {
  disableEditing?: boolean;
  index: number;
  showTitle?: boolean;
}

const GroupMessage = memo<GroupMessageProps>((props) => {
  const {
    showTitle,
    id,
    disableEditing,
    usage,
    index,
    createdAt,
    meta,
    children,
    performance,
    model,
    provider,
  } = props;
  const avatar = meta;
  const { mobile } = useResponsive();
  const placement = 'left';
  const type = useAgentStore(agentChatConfigSelectors.displayMode);
  const variant = type === 'chat' ? 'bubble' : 'docs';

  const { styles } = useStyles({
    editing: false,
    placement,
    primary: false,
    showTitle,
    time: createdAt,
    title: avatar.title,
    variant,
  });

  const [isInbox] = useSessionStore((s) => [sessionSelectors.isInboxSession(s)]);
  const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
  const openChatSettings = useOpenChatSettings();
  const lastAssistantMsg = useChatStore(chatSelectors.getGroupLatestMessageWithoutTools(id));

  const contentId = lastAssistantMsg?.id;

  const isEditing = useChatStore(messageStateSelectors.isMessageEditing(contentId || ''));

  // ======================= Performance Optimization ======================= //
  // these useMemo/useCallback are all for the performance optimization
  // maybe we can remove it in React 19
  // ======================================================================== //
  const onAvatarClick = useCallback(() => {
    if (!isInbox) {
      toggleSystemRole(true);
    } else {
      openChatSettings();
    }
  }, [isInbox]);

  return (
    <Flexbox className={styles.container} gap={mobile ? 6 : 12}>
      <Flexbox gap={4} horizontal>
        <Avatar
          alt={avatar.title || 'avatar'}
          avatar={avatar}
          onClick={onAvatarClick}
          placement={placement}
          size={mobile ? MOBILE_AVATAR_SIZE : undefined}
          style={{ marginTop: 6 }}
        />
        <Title avatar={avatar} placement={placement} showTitle time={createdAt} />
      </Flexbox>
      {isEditing && contentId ? (
        <EditState content={lastAssistantMsg?.content} id={contentId} />
      ) : (
        <Flexbox
          align={'flex-start'}
          className={styles.messageContent}
          data-layout={'vertical'}
          direction={'vertical'}
          gap={8}
          width={'100%'}
        >
          {children && children.length > 0 && (
            <GroupChildren
              blocks={children}
              contentId={contentId}
              disableEditing={disableEditing}
              messageIndex={index}
            />
          )}

          {model && (
            <Usage metadata={{ ...performance, ...usage }} model={model} provider={provider!} />
          )}
          {!disableEditing && (
            <Flexbox align={'flex-start'} className={styles.actions} role="menubar">
              <GroupActionsBar
                contentBlock={lastAssistantMsg}
                contentId={contentId}
                data={props}
                id={id}
                index={index}
              />
            </Flexbox>
          )}
        </Flexbox>
      )}

      {mobile && <BorderSpacing borderSpacing={MOBILE_AVATAR_SIZE} />}
    </Flexbox>
  );
});

export default GroupMessage;
