import { ActionIcon, Dropdown, Icon, type MenuProps } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { MoreHorizontalIcon, PencilLine, Trash } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGroupActions, useMenuItems, useSessionActions } from '@/features/NavPanel/hooks';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import { useAgentModal } from '../../ModalProvider';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));
interface ActionsProps {
  id?: string;
  isCustomGroup?: boolean;
  isPinned?: boolean;
}

const Actions = memo<ActionsProps>(({ id, isCustomGroup, isPinned }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const { modal } = App.useApp();

  const [removeSessionGroup] = useSessionStore((s) => [s.removeSessionGroup]);

  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);

  // Modal management
  const {
    openMemberSelectionModal,
    closeMemberSelectionModal,
    openRenameGroupModal,
    openConfigGroupModal,
  } = useAgentModal();

  // Session/Agent creation
  const { createAgent, isLoading: isCreatingAgent } = useSessionActions();

  // Group creation
  const { createGroupWithMembers, isCreating: isCreatingGroup } = useGroupActions();

  // Handler to open member selection modal with callbacks
  const handleOpenMemberSelection = useCallback(() => {
    openMemberSelectionModal({
      onCancel: closeMemberSelectionModal,
      onConfirm: async (selectedAgents, hostConfig, enableSupervisor) => {
        await createGroupWithMembers(
          selectedAgents,
          'New Group Chat',
          hostConfig,
          enableSupervisor,
        );
        closeMemberSelectionModal();
      },
    });
  }, [openMemberSelectionModal, closeMemberSelectionModal, createGroupWithMembers]);

  // Menu items
  const { createConfigMenuItem, createNewAgentMenuItem, createNewGroupChatMenuItem } = useMenuItems(
    {
      onCreateAgent: () => createAgent({ groupId: id, isPinned }),
      onCreateGroup: handleOpenMemberSelection,
      onOpenConfig: () => openConfigGroupModal(),
    },
  );

  const sessionGroupConfigPublicItem = createConfigMenuItem();
  const newAgentPublicItem = createNewAgentMenuItem();
  const newGroupChatItem = createNewGroupChatMenuItem();

  const isLoading = isCreatingAgent || isCreatingGroup;

  const customGroupItems: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('sessionGroup.rename'),
        onClick: (info) => {
          info.domEvent?.stopPropagation();
          openRenameGroupModal(id!);
        },
      },
      sessionGroupConfigPublicItem,
      {
        type: 'divider',
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: (info) => {
          info.domEvent?.stopPropagation();
          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: async () => {
              if (!id) return;
              await removeSessionGroup(id);
            },
            rootClassName: styles.modalRoot,
            title: t('sessionGroup.confirmRemoveGroupAlert'),
          });
        },
      },
    ],
    [
      t,
      sessionGroupConfigPublicItem,
      openRenameGroupModal,
      modal,
      id,
      removeSessionGroup,
      styles.modalRoot,
    ],
  );

  const defaultItems: MenuProps['items'] = useMemo(
    () => [sessionGroupConfigPublicItem],
    [sessionGroupConfigPublicItem],
  );

  const tailItems = useMemo(
    () => (isCustomGroup ? customGroupItems : defaultItems),
    [isCustomGroup, customGroupItems, defaultItems],
  );

  const menuItems = useMemo(() => {
    const items: MenuProps['items'] = [];

    if (showCreateSession) {
      items.push(newAgentPublicItem);

      if (enableGroupChat) {
        items.push(newGroupChatItem);
      }

      items.push({ type: 'divider' });
    }

    items.push(...tailItems);

    return items;
  }, [showCreateSession, enableGroupChat, newAgentPublicItem, newGroupChatItem, tailItems]);

  return (
    <Dropdown
      arrow={false}
      menu={{
        items: menuItems,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
        },
      }}
      trigger={['click']}
    >
      <ActionIcon
        icon={MoreHorizontalIcon}
        loading={isLoading}
        onClick={(e) => {
          e.stopPropagation();
        }}
        size={'small'}
      />
    </Dropdown>
  );
});

export default Actions;
