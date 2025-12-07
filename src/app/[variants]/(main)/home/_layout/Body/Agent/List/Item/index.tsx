import { ActionIcon, Icon, type MenuProps } from '@lobehub/ui';
import { Dropdown } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2, PinIcon } from 'lucide-react';
import { CSSProperties, DragEvent, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDropdownMenu } from '@/app/[variants]/(main)/home/_layout/Body/Agent/List/Item/useDropdownMenu';
import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { SidebarAgentItem, useHomeStore } from '@/store/home';

import NavItem from '../../../../../../../../../features/NavPanel/components/NavItem';
import { useAgentModal } from '../../ModalProvider';
import Actions from './Actions';
import Avatar from './Avatar';
import Editing from './Editing';

interface SessionItemProps {
  className?: string;
  item: SidebarAgentItem;
  style?: CSSProperties;
}

const SessionItem = memo<SessionItemProps>(({ item, style, className }) => {
  const { id, avatar, title, pinned, type, sessionId } = item;
  const { t } = useTranslation('chat');

  const theme = useTheme();
  const { openCreateGroupModal } = useAgentModal();
  const openSessionInNewWindow = useGlobalStore((s) => s.openSessionInNewWindow);

  // Get UI state from homeStore (editing, updating)
  const [editing, isUpdating] = useHomeStore((s) => [
    s.agentRenamingId === id,
    s.agentUpdatingId === id,
  ]);

  // Separate loading state from chat store - only subscribe if this session is active
  const isLoading = useChatStore(operationSelectors.isAgentRuntimeRunning);

  // Get display title with fallback
  const displayTitle = title || t('untitledAgent');

  // Memoize event handlers
  const handleDoubleClick = useCallback(() => {
    openSessionInNewWindow(sessionId || id);
  }, [id, sessionId, openSessionInNewWindow]);

  const handleDragStart = useCallback(
    (e: DragEvent) => {
      e.dataTransfer.setData('text/plain', id);
    },
    [id],
  );

  const handleDragEnd = useCallback(
    (e: DragEvent) => {
      if (e.dataTransfer.dropEffect === 'none') {
        openSessionInNewWindow(sessionId || id);
      }
    },
    [id, sessionId, openSessionInNewWindow],
  );

  const handleOpenCreateGroupModal = useCallback(() => {
    openCreateGroupModal(id);
  }, [id, openCreateGroupModal]);

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      useHomeStore.getState().setAgentRenamingId(visible ? id : null);
    },
    [id],
  );

  // Memoize pin icon
  const pinIcon = useMemo(
    () =>
      pinned ? (
        <ActionIcon icon={PinIcon} size={12} style={{ opacity: 0.5, pointerEvents: 'none' }} />
      ) : undefined,
    [pinned],
  );

  // Memoize avatar icon (show loader when updating)
  const avatarIcon = useMemo(() => {
    if (isUpdating) {
      return <Icon color={theme.colorTextDescription} icon={Loader2} size={18} spin />;
    }
    return <Avatar avatar={avatar || ''} type={type} />;
  }, [isUpdating, avatar, type, theme.colorTextDescription]);

  const dropdownMenu: MenuProps['items'] = useDropdownMenu({
    group: undefined, // TODO: pass group from parent if needed
    id,
    openCreateGroupModal: handleOpenCreateGroupModal,
    parentType: type,
    pinned: pinned ?? false,
    sessionType: type,
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
          title={displayTitle}
        />
      </Dropdown>
      <Editing
        avatar={avatar ?? undefined}
        id={id}
        title={displayTitle}
        toggleEditing={toggleEditing}
      />
    </>
  );
});

export default SessionItem;
