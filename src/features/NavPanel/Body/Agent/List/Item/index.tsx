import { ActionIcon } from '@lobehub/ui';
import { PinIcon } from 'lucide-react';
import React, { CSSProperties, memo } from 'react';
import { shallow } from 'zustand/shallow';

import { DEFAULT_AVATAR } from '@/const/meta';
import { isDesktop } from '@/const/version';
import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeGroupSession } from '@/types/session';

import NavItem from '../../../../NavItem';
import { useAgentModal } from '../../ModalProvider';
import Actions from './Actions';
import Avatar from './Avatar';

interface SessionItemProps {
  id: string;
  style?: CSSProperties;
}

const SessionItem = memo<SessionItemProps>(({ id, style }) => {
  const { openCreateGroupModal } = useAgentModal();

  const openSessionInNewWindow = useGlobalStore((s) => s.openSessionInNewWindow);

  const [active] = useSessionStore((s) => [s.activeId === id]);
  const [loading] = useChatStore((s) => [
    operationSelectors.isAgentRuntimeRunning(s) && id === s.activeId,
  ]);

  const [pin, title, avatar, avatarBackground, members, group, sessionType] = useSessionStore(
    (s) => {
      const session = sessionSelectors.getSessionById(id)(s);
      const meta = session.meta;

      return [
        sessionHelpers.getSessionPinned(session),
        sessionMetaSelectors.getTitle(meta),
        sessionMetaSelectors.getAvatar(meta),
        meta.backgroundColor,
        (session as LobeGroupSession).members,
        session?.group,
        session.type,
      ];
    },
  );

  const handleDoubleClick = () => {
    if (isDesktop) {
      openSessionInNewWindow(id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag data to identify the session being dragged
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // If drag ends without being dropped in a valid target, open in new window
    if (isDesktop && e.dataTransfer.dropEffect === 'none') {
      openSessionInNewWindow(id);
    }
  };

  const currentUser = useUserStore((s) => ({
    avatar: userProfileSelectors.userAvatar(s),
    name: userProfileSelectors.displayUserName(s) || userProfileSelectors.nickName(s) || 'You',
  }));

  const sessionAvatar: string | { avatar: string; background?: string }[] =
    sessionType === 'group'
      ? [
          {
            avatar: currentUser.avatar || DEFAULT_AVATAR,
            background: undefined,
          },
          ...(members?.map((member) => ({
            avatar: member.avatar || DEFAULT_AVATAR,
            background: member.backgroundColor || undefined,
          })) || []),
        ]
      : avatar;

  return (
    <NavItem
      actions={
        <Actions
          group={group}
          id={id}
          openCreateGroupModal={() => openCreateGroupModal(id)}
          parentType={sessionType}
        />
      }
      active={active}
      draggable={isDesktop}
      extra={
        pin ? (
          <ActionIcon icon={PinIcon} size={'small'} style={{ pointerEvents: 'none' }} />
        ) : undefined
      }
      icon={
        <Avatar avatar={sessionAvatar} avatarBackground={avatarBackground} type={sessionType} />
      }
      key={id}
      loading={loading}
      onDoubleClick={handleDoubleClick}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      style={style}
      title={title}
    />
  );
}, shallow);

export default SessionItem;
