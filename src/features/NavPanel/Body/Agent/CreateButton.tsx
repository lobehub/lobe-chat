import { ActionIcon, Dropdown, type MenuProps } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useGroupActions, useMenuItems, useSessionActions } from '../../hooks';
import { useAgentModal } from './ModalProvider';

const CreateButton = memo(() => {
  const { showCreateSession } = useServerConfigStore(featureFlagsSelectors);
  const { openGroupWizardModal, closeGroupWizardModal, openConfigGroupModal } = useAgentModal();

  // Session/Agent creation
  const { createAgent, isLoading: isCreatingAgent } = useSessionActions();

  // Group creation
  const {
    createGroupFromTemplate,
    createGroupWithMembers,
    isCreating: isCreatingGroup,
  } = useGroupActions();

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

  // Menu items
  const { createConfigMenuItem, createMenuItems } = useMenuItems({
    onCreateAgent: () => createAgent(),
    onCreateGroup: handleOpenGroupWizard,
    onOpenConfig: openConfigGroupModal,
  });

  const dropdownItems: MenuProps['items'] = useMemo(() => {
    if (!createMenuItems) return [createConfigMenuItem()];
    return [...createMenuItems, { type: 'divider' as const }, createConfigMenuItem()];
  }, [createMenuItems, createConfigMenuItem]);

  const isLoading = isCreatingAgent || isCreatingGroup;

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

export default CreateButton;
