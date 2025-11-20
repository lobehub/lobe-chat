import { ActionIcon, Dropdown, type MenuProps } from '@lobehub/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import { useCreateMenuItems, useSessionGroupMenuItems } from '@/features/NavPanel/hooks';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useAgentModal } from '../../ModalProvider';

interface ActionsProps {
  id?: string;
  isCustomGroup?: boolean;
  isPinned?: boolean;
  toggleEditing?: (visible?: boolean) => void;
}

const Actions = memo<ActionsProps>(({ id, isCustomGroup, isPinned, toggleEditing }) => {
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);

  // Modal management
  const { openMemberSelectionModal, closeMemberSelectionModal, openConfigGroupModal } =
    useAgentModal();

  // Session group menu items
  const {
    renameGroupMenuItem,
    configGroupMenuItem,
    deleteGroupMenuItem,
    createGroupWithMembers,
    isCreatingGroup,
  } = useSessionGroupMenuItems();

  // Create menu items
  const { createAgentMenuItem, createGroupChatMenuItem, isCreatingAgent } = useCreateMenuItems();

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

  const isLoading = isCreatingAgent || isCreatingGroup;

  const menuItems = useMemo(() => {
    const createAgentItem = createAgentMenuItem({ groupId: id, isPinned });
    const createGroupChatItem = createGroupChatMenuItem(handleOpenMemberSelection);
    const configItem = configGroupMenuItem(openConfigGroupModal);
    const renameItem = renameGroupMenuItem(toggleEditing!);
    const deleteItem = id ? deleteGroupMenuItem(id) : null;

    return [
      ...(showCreateSession
        ? [
            createAgentItem,
            ...(enableGroupChat ? [createGroupChatItem] : []),
            { type: 'divider' as const },
          ]
        : []),
      ...(isCustomGroup
        ? [renameItem, configItem, { type: 'divider' as const }, deleteItem]
        : [configItem]),
    ].filter(Boolean) as MenuProps['items'];
  }, [
    showCreateSession,
    enableGroupChat,
    isCustomGroup,
    id,
    isPinned,
    toggleEditing,
    createAgentMenuItem,
    createGroupChatMenuItem,
    configGroupMenuItem,
    renameGroupMenuItem,
    deleteGroupMenuItem,
    handleOpenMemberSelection,
    openConfigGroupModal,
  ]);

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
