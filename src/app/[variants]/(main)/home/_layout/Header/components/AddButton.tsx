import { ActionIcon, Dropdown, type MenuProps } from '@lobehub/ui';
import { MessageSquarePlus, SquarePlus } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useCreateMenuItems } from '../../../../../../../features/NavPanel/hooks';

const AddButton = memo(() => {
  const { t } = useTranslation('chat');
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create menu items
  const {
    createAgentMenuItem,
    createGroupChatMenuItem,
    createAgent,
    createGroupFromTemplate,
    createGroupWithMembers,
    isValidatingAgent,
    isCreatingGroup,
  } = useCreateMenuItems();

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

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
      closeModal();
    },
    [createGroupWithMembers, t, closeModal],
  );

  const handleCreateGroupFromTemplate = useCallback(
    async (
      templateId: string,
      hostConfig?: { model?: string; provider?: string },
      enableSupervisor?: boolean,
      selectedMemberTitles?: string[],
    ) => {
      await createGroupFromTemplate(templateId, hostConfig, enableSupervisor, selectedMemberTitles);
      closeModal();
    },
    [createGroupFromTemplate, closeModal],
  );

  const dropdownItems = useMemo(() => {
    const createAgentItem = createAgentMenuItem();
    const createGroupChatItem = createGroupChatMenuItem(openModal);
    return [createAgentItem, createGroupChatItem].filter(Boolean) as MenuProps['items'];
  }, [createAgentMenuItem, createGroupChatMenuItem, openModal]);

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
