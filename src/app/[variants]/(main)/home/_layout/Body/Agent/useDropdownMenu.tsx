import { Icon, type MenuProps } from '@lobehub/ui';
import { Hash, LucideCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateMenuItems } from '@/features/NavPanel/hooks';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

interface AgentActionsDropdownMenuProps {
  handleOpenGroupWizard: () => void;
  openConfigGroupModal: () => void;
}

export const useAgentActionsDropdownMenu = ({
  handleOpenGroupWizard,
  openConfigGroupModal,
}: AgentActionsDropdownMenuProps): MenuProps['items'] => {
  const { t } = useTranslation('common');
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);

  const [agentPageSize, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.agentPageSize(s),
    s.updateSystemStatus,
  ]);

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

    const pageSizeOptions = [20, 40, 60, 100];
    const pageSizeItems = pageSizeOptions.map((size) => ({
      icon: agentPageSize === size ? <Icon icon={LucideCheck} /> : <div />,
      key: `pageSize-${size}`,
      label: `${size} 个条目`,
      onClick: () => {
        updateSystemStatus({ agentPageSize: size });
      },
    }));

    return [
      ...(showCreateSession
        ? [
            createAgentItem,
            ...(enableGroupChat ? [createGroupChatItem] : []),
            { type: 'divider' as const },
            createSessionGroupItem,
            configItem,
            { type: 'divider' as const },
            {
              children: pageSizeItems,
              icon: <Icon icon={Hash} />,
              key: 'displayItems',
              label: t('navPanel.displayItems'),
            },
          ]
        : []),
    ].filter(Boolean) as MenuProps['items'];
  }, [
    showCreateSession,
    enableGroupChat,
    agentPageSize,
    updateSystemStatus,
    createAgentMenuItem,
    createGroupChatMenuItem,
    createSessionGroupMenuItem,
    configMenuItem,
    handleOpenGroupWizard,
    openConfigGroupModal,
    t,
  ]);
};
