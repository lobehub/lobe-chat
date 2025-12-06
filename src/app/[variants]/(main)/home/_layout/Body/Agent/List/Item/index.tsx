import { ActionIcon, Icon, type MenuProps } from '@lobehub/ui';
import { Dropdown } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2, PinIcon } from 'lucide-react';
import { CSSProperties, DragEvent, memo, useCallback, useMemo } from 'react';

import { useDropdownMenu } from '@/app/[variants]/(main)/home/_layout/Body/Agent/List/Item/useDropdownMenu';
import { DEFAULT_AVATAR } from '@/const/meta';
import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionHelpers } from '@/store/session/helpers';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeGroupSession } from '@/types/session';

import NavItem from '../../../../../../../../../features/NavPanel/components/NavItem';
import { useAgentModal } from '../../ModalProvider';
import Actions from './Actions';
import Avatar from './Avatar';
import Editing from './Editing';

interface SessionItemProps {
  className?: string;
  id: string;
  style?: CSSProperties;
}

const SessionItem = memo<SessionItemProps>(({ id, style, className }) => {
  const theme = useTheme();
  const { openCreateGroupModal } = useAgentModal();
  const openSessionInNewWindow = useGlobalStore((s) => s.openSessionInNewWindow);
  const [editing, isUpdating] = useSessionStore((s) => [
    s.sessionRenamingId === id,
    s.sessionUpdatingId === id,
  ]);

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
    openSessionInNewWindow(id);
  }, [id, openSessionInNewWindow]);

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      e.dataTransfer.setData('text/plain', id);
    },
    [id],
  );

  const handleDragEnd = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer.dropEffect === 'none') {
        openSessionInNewWindow(id);
      }
    },
    [id, openSessionInNewWindow],
  );

  const handleOpenCreateGroupModal = useCallback(() => {
    openCreateGroupModal(id);
  }, [id, openCreateGroupModal]);

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      useSessionStore.setState(
        { sessionRenamingId: visible ? id : null },
        false,
        'toggleSessionRenaming',
      );
    },
    [id],
  );

  // Memoize pin icon
  const pinIcon = useMemo(
    () =>
      sessionData.pin ? (
        <ActionIcon icon={PinIcon} size={12} style={{ opacity: 0.5, pointerEvents: 'none' }} />
      ) : undefined,
    [sessionData.pin],
  );

  // Memoize avatar icon (show loader when updating)
  const avatarIcon = useMemo(() => {
    if (isUpdating) {
      return <Icon color={theme.colorTextDescription} icon={Loader2} size={18} spin />;
    }
    return (
      <Avatar
        avatar={sessionAvatar}
        avatarBackground={sessionData.avatarBackground}
        type={sessionData.type}
      />
    );
  }, [
    isUpdating,
    sessionAvatar,
    sessionData.avatarBackground,
    sessionData.type,
    theme.colorTextDescription,
  ]);

  const dropdownMenu: MenuProps['items'] = useDropdownMenu({
    group: sessionData.group,
    id,
    openCreateGroupModal: handleOpenCreateGroupModal,
    parentType: sessionData.type,
    toggleEditing,
  });

  return (
    <>
      <Dropdown
        menu={{
          items: dropdownMenu,
        }}
        trigger={['contextMenu']}
      >
        <NavItem
          actions={<Actions dropdownMenu={dropdownMenu} />}
          active={active}
          className={className}
          disabled={editing || isUpdating}
          draggable={!editing && !isUpdating}
          extra={pinIcon}
          icon={avatarIcon}
          key={id}
          loading={isLoading}
          onDoubleClick={handleDoubleClick}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          style={style}
          title={sessionData.title}
        />
      </Dropdown>
      <Editing id={id} title={sessionData.title} toggleEditing={toggleEditing} />
    </>
  );
});

export default SessionItem;
