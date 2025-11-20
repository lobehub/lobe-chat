import { ActionIcon, Dropdown, type MenuProps } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import { useGroupActions, useMenuItems, useSessionActions } from '../../hooks';
import { useAgentModal } from './ModalProvider';

const Actions = memo(() => {
  const { t } = useTranslation('chat');
  const { showCreateSession } = useServerConfigStore(featureFlagsSelectors);
  const { openGroupWizardModal, closeGroupWizardModal, openConfigGroupModal } = useAgentModal();
  const [addSessionGroup] = useSessionStore((s) => [s.addSessionGroup]);
  const [isCreatingSessionGroup, setIsCreatingSessionGroup] = useState(false);

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

  const handleAddSessionGroup = useCallback(async () => {
    setIsCreatingSessionGroup(true);
    await addSessionGroup(t('sessionGroup.newGroup'));
    setIsCreatingSessionGroup(false);
  }, [addSessionGroup, t]);

  // Menu items
  const { createConfigMenuItem, createMenuItems, createAddSessionGroupMenuItem } = useMenuItems({
    onCreateAgent: () => createAgent(),
    onCreateGroup: handleOpenGroupWizard,
    onCreateSessionGroup: handleAddSessionGroup,
    onOpenConfig: openConfigGroupModal,
  });

  const dropdownItems: MenuProps['items'] = useMemo(() => {
    const configItem = createConfigMenuItem();
    const addSessionGroupItem = createAddSessionGroupMenuItem();
    if (!createMenuItems) return [addSessionGroupItem, configItem];
    return [...createMenuItems, { type: 'divider' as const }, addSessionGroupItem, configItem];
  }, [createMenuItems, createConfigMenuItem, createAddSessionGroupMenuItem]);

  const isLoading = isCreatingAgent || isCreatingGroup || isCreatingSessionGroup;

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
