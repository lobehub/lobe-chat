import { ActionIcon, Dropdown, type MenuProps } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import { useCreateMenuItems } from '@/features/NavPanel/hooks';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useAgentModal } from './ModalProvider';

const Actions = memo(() => {
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);
  const { openGroupWizardModal, closeGroupWizardModal, openConfigGroupModal } = useAgentModal();

  // Create menu items
  const {
    createAgentMenuItem,
    createGroupChatMenuItem,
    createSessionGroupMenuItem,
    configMenuItem,
    createGroupFromTemplate,
    createGroupWithMembers,
    isLoading,
  } = useCreateMenuItems();

  // Adapter functions to match GroupWizard interface
  const handleGroupWizardCreateCustom = useCallback(
    async (
      selectedAgents: string[],
      hostConfig?: { model?: string; provider?: string },
      enableSupervisor?: boolean,
    ) => {
      await createGroupWithMembers(selectedAgents, undefined, hostConfig, enableSupervisor);
    },
    [createGroupWithMembers],
  );

  const handleGroupWizardCreateFromTemplate = useCallback(
    async (
      templateId: string,
      hostConfig?: { model?: string; provider?: string },
      enableSupervisor?: boolean,
      selectedMemberTitles?: string[],
    ) => {
      await createGroupFromTemplate(templateId, hostConfig, enableSupervisor, selectedMemberTitles);
    },
    [createGroupFromTemplate],
  );

  const handleOpenGroupWizard = useCallback(() => {
    openGroupWizardModal({
      onCancel: closeGroupWizardModal,
      onCreateCustom: handleGroupWizardCreateCustom,
      onCreateFromTemplate: handleGroupWizardCreateFromTemplate,
    });
  }, [
    openGroupWizardModal,
    closeGroupWizardModal,
    handleGroupWizardCreateFromTemplate,
    handleGroupWizardCreateCustom,
  ]);

  const dropdownItems: MenuProps['items'] = useMemo(() => {
    const createAgentItem = createAgentMenuItem();
    const createGroupChatItem = createGroupChatMenuItem(handleOpenGroupWizard);
    const createSessionGroupItem = createSessionGroupMenuItem();
    const configItem = configMenuItem(openConfigGroupModal);

    return [
      createAgentItem,
      ...(enableGroupChat ? [createGroupChatItem] : []),
      { type: 'divider' as const },
      createSessionGroupItem,
      configItem,
    ].filter(Boolean) as MenuProps['items'];
  }, [
    enableGroupChat,
    createAgentMenuItem,
    createGroupChatMenuItem,
    createSessionGroupMenuItem,
    configMenuItem,
    handleOpenGroupWizard,
    openConfigGroupModal,
  ]);

  if (!showCreateSession) return;

  return (
    <Dropdown
      menu={{
        items: dropdownItems,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
        },
      }}
      trigger={['click']}
    >
      <ActionIcon icon={PlusIcon} loading={isLoading} size={'small'} style={{ flex: 'none' }} />
    </Dropdown>
  );
});

export default Actions;
