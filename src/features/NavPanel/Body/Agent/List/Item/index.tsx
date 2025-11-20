import { ActionIcon } from '@lobehub/ui';
import { PinIcon } from 'lucide-react';
import { CSSProperties, DragEvent, memo, useCallback, useMemo } from 'react';

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
  className?: string;
  id: string;
  style?: CSSProperties;
}

const SessionItem = memo<SessionItemProps>(({ id, style, className }) => {
  const { openCreateGroupModal } = useAgentModal();
  const openSessionInNewWindow = useGlobalStore((s) => s.openSessionInNewWindow);

  // Combine related selectors to reduce store subscriptions
  const { active, sessionData } = useSessionStore(
    useCallback(
      (s) => {
        const session = sessionSelectors.getSessionById(id)(s);
        const meta = session.meta;
        const isActive = s.activeId === id;

        return {
          active: isActive,
          sessionData: {
            avatar: sessionMetaSelectors.getAvatar(meta),
            avatarBackground: meta.backgroundColor,
            group: session?.group,
            members: (session as LobeGroupSession).members,
            pin: sessionHelpers.getSessionPinned(session),
            title: sessionMetaSelectors.getTitle(meta),
            type: session.type,
          },
        };
      },
      [id],
    ),
  );

  // Separate loading state from chat store - only subscribe if this session is active
  const isLoading = useChatStore(
    useCallback((s) => (active ? operationSelectors.isAgentRuntimeRunning(s) : false), [active]),
  );

  // Memoize current user to avoid repeated selectors - only needed for group sessions
  const currentUserAvatar = useUserStore(
    useCallback(
      (s) =>
        sessionData.type === 'group' ? userProfileSelectors.userAvatar(s) || DEFAULT_AVATAR : '',
      [sessionData.type],
    ),
  );

  // Memoize session avatar computation
  const sessionAvatar = useMemo<string | { avatar: string; background?: string }[]>(() => {
    if (sessionData.type !== 'group') {
      return sessionData.avatar;
    }

    return [
      {
        avatar: currentUserAvatar,
        background: undefined,
      },
      ...(sessionData.members?.map((member) => ({
        avatar: member.avatar || DEFAULT_AVATAR,
        background: member.backgroundColor || undefined,
      })) || []),
    ];
  }, [sessionData.type, sessionData.avatar, sessionData.members, currentUserAvatar]);

  // Memoize event handlers
  const handleDoubleClick = useCallback(() => {
    if (isDesktop) {
      openSessionInNewWindow(id);
    }
  }, [id, openSessionInNewWindow]);

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      e.dataTransfer.setData('text/plain', id);
    },
    [id],
  );

  const handleDragEnd = useCallback(
    (e: DragEvent) => {
      if (isDesktop && e.dataTransfer.dropEffect === 'none') {
        openSessionInNewWindow(id);
      }
    },
    [id, openSessionInNewWindow],
  );

  const handleOpenCreateGroupModal = useCallback(() => {
    openCreateGroupModal(id);
  }, [id, openCreateGroupModal]);

  // Memoize pin icon
  const pinIcon = useMemo(
    () =>
      sessionData.pin ? (
        <ActionIcon icon={PinIcon} size={12} style={{ opacity: 0.5, pointerEvents: 'none' }} />
      ) : undefined,
    [sessionData.pin],
  );

  return (
    <NavItem
      actions={
        <Actions
          group={sessionData.group}
          id={id}
          openCreateGroupModal={handleOpenCreateGroupModal}
          parentType={sessionData.type}
        />
      }
      active={active}
      className={className}
      draggable={isDesktop}
      extra={pinIcon}
      icon={
        <Avatar
          avatar={sessionAvatar}
          avatarBackground={sessionData.avatarBackground}
          type={sessionData.type}
        />
      }
      key={id}
      loading={isLoading}
      onDoubleClick={handleDoubleClick}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      style={style}
      title={sessionData.title}
    />
  );
});

export default SessionItem;
