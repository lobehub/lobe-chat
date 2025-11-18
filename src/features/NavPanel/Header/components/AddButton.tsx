import { ActionIcon, Dropdown, Icon } from '@lobehub/ui';
import { Bot, MessageSquarePlus, SquarePlus, Users } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useGroupCreation, useSessionCreation } from '../hooks';

const AddButton = memo(() => {
  const { t } = useTranslation('chat');
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);
  const [isGroupWizardOpen, setIsGroupWizardOpen] = useState(false);

  const { mutateAgent, isValidatingAgent } = useSessionCreation();
  const { createGroupFromTemplate, createGroupWithMembers, isCreatingGroup } = useGroupCreation();

  const handleCreateGroupFromTemplate = useCallback(
    async (
      templateId: string,
      hostConfig?: { model?: string; provider?: string },
      enableSupervisor?: boolean,
      selectedMemberTitles?: string[],
    ) => {
      const success = await createGroupFromTemplate(
        templateId,
        hostConfig,
        enableSupervisor,
        selectedMemberTitles,
      );
      if (success) {
        setIsGroupWizardOpen(false);
      }
    },
    [createGroupFromTemplate],
  );

  const handleCreateGroupWithMembers = useCallback(
    async (
      selectedAgents: string[],
      hostConfig?: { model?: string; provider?: string },
      enableSupervisor?: boolean,
    ) => {
      const success = await createGroupWithMembers(
        selectedAgents,
        t('defaultGroupChat'),
        hostConfig,
        enableSupervisor,
      );
      if (success) {
        setIsGroupWizardOpen(false);
      }
    },
    [createGroupWithMembers, t],
  );

  const handleGroupWizardCancel = useCallback(() => {
    setIsGroupWizardOpen(false);
  }, []);

  const handleOpenGroupWizard = useCallback(() => {
    setIsGroupWizardOpen(true);
  }, []);

  const handleClickMutateAgent = useCallback(() => {
    mutateAgent();
  }, [mutateAgent]);

  const dropdownItems = useMemo(
    () => [
      {
        icon: <Icon icon={Bot} />,
        key: 'newAgent',
        label: t('newAgent'),
        onClick: handleClickMutateAgent,
      },
      {
        icon: <Icon icon={Users} />,
        key: 'newGroup',
        label: t('newGroupChat'),
        onClick: handleOpenGroupWizard,
      },
    ],
    [t, handleClickMutateAgent, handleOpenGroupWizard],
  );

  if (!showCreateSession) return;

  if (enableGroupChat)
    return (
      <>
        <Dropdown menu={{ items: dropdownItems }} trigger={['hover']}>
          <ActionIcon
            icon={SquarePlus}
            loading={isValidatingAgent || isCreatingGroup}
            size={DESKTOP_HEADER_ICON_SIZE}
            style={{ flex: 'none' }}
          />
        </Dropdown>
        <ChatGroupWizard
          isCreatingFromTemplate={isCreatingGroup}
          onCancel={handleGroupWizardCancel}
          onCreateCustom={handleCreateGroupWithMembers}
          onCreateFromTemplate={handleCreateGroupFromTemplate}
          open={isGroupWizardOpen}
        />
      </>
    );

  return (
    <ActionIcon
      icon={MessageSquarePlus}
      loading={isValidatingAgent}
      onClick={handleClickMutateAgent}
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
