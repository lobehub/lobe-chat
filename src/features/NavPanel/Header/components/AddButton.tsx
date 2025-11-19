import { ActionIcon, Dropdown } from '@lobehub/ui';
import { MessageSquarePlus, SquarePlus } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useGroupActions, useMenuItems, useSessionActions } from '../../hooks';

const AddButton = memo(() => {
  const { t } = useTranslation('chat');
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);

  // Session/Agent creation
  const { createAgent, isValidatingAgent } = useSessionActions();

  // Group creation
  const {
    createGroupFromTemplate,
    createGroupWithMembers,
    isCreating: isCreatingGroup,
    isModalOpen,
    openModal,
    closeModal,
  } = useGroupActions();

  const handleCreateGroupWithMembers = useCallback(
    async (
      selectedAgents: string[],
      hostConfig?: { model?: string; provider?: string },
      enableSupervisor?: boolean,
    ) => {
      await createGroupWithMembers(
        selectedAgents,
        t('defaultGroupChat'),
        hostConfig,
        enableSupervisor,
      );
    },
    [createGroupWithMembers, t],
  );

  const handleCreateGroupFromTemplate = useCallback(
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

  // Menu items
  const { createMenuItems: dropdownItems } = useMenuItems({
    onCreateAgent: () => createAgent(),
    onCreateGroup: openModal,
  });

  if (!showCreateSession) return;

  if (enableGroupChat)
    return (
      <>
        <Dropdown menu={{ items: dropdownItems || [] }} trigger={['hover']}>
          <ActionIcon
            icon={SquarePlus}
            loading={isValidatingAgent || isCreatingGroup}
            size={DESKTOP_HEADER_ICON_SIZE}
            style={{ flex: 'none' }}
          />
        </Dropdown>
        <ChatGroupWizard
          isCreatingFromTemplate={isCreatingGroup}
          onCancel={closeModal}
          onCreateCustom={handleCreateGroupWithMembers}
          onCreateFromTemplate={handleCreateGroupFromTemplate}
          open={isModalOpen}
        />
      </>
    );

  return (
    <ActionIcon
      icon={MessageSquarePlus}
      loading={isValidatingAgent}
      onClick={() => createAgent()}
      size={DESKTOP_HEADER_ICON_SIZE}
      style={{ flex: 'none' }}
      title={t('newAgent')}
      tooltipProps={{
        placement: 'bottom',
      }}
    />
  );
});

export default AddButton;
