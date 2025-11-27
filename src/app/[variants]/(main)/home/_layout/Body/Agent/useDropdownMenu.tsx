import { type MenuProps } from '@lobehub/ui';
import { useMemo } from 'react';

import { useCreateMenuItems } from '@/features/NavPanel/hooks';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

interface AgentActionsDropdownMenuProps {
  handleOpenGroupWizard: () => void;
  openConfigGroupModal: () => void;
}

export const useAgentActionsDropdownMenu = ({
  handleOpenGroupWizard,
  openConfigGroupModal,
}: AgentActionsDropdownMenuProps): MenuProps['items'] => {
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);

  // Create menu items
  const {
    createAgentMenuItem,
    createGroupChatMenuItem,
    createSessionGroupMenuItem,
    configMenuItem,
  } = useCreateMenuItems();

  return useMemo(() => {
    const createAgentItem = createAgentMenuItem();
    const createGroupChatItem = createGroupChatMenuItem(handleOpenGroupWizard);
    const createSessionGroupItem = createSessionGroupMenuItem();
    const configItem = configMenuItem(openConfigGroupModal);

    return [
      ...(showCreateSession
        ? [
            createAgentItem,
            ...(enableGroupChat ? [createGroupChatItem] : []),
            { type: 'divider' as const },
            createSessionGroupItem,
            configItem,
          ]
        : []),
    ].filter(Boolean) as MenuProps['items'];
  }, [
    showCreateSession,
    enableGroupChat,
    createAgentMenuItem,
    createGroupChatMenuItem,
    createSessionGroupMenuItem,
    configMenuItem,
    handleOpenGroupWizard,
    openConfigGroupModal,
  ]);
};
