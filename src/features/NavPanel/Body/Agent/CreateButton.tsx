import { ActionIcon, Dropdown, Icon, type MenuProps } from '@lobehub/ui';
import { Bot, PlusIcon, Users } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useGroupCreation, useSessionCreation } from '../../Header/hooks';

type ItemOfType<T> = T extends (infer Item)[] ? Item : never;
type MenuItemType = ItemOfType<MenuProps['items']>;

const CreateButton = memo(() => {
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
    () =>
      [
        {
          icon: <Icon icon={Bot} />,
          key: 'newAgent',
          label: t('newAgent'),
          onClick: handleClickMutateAgent,
        },
        enableGroupChat && {
          icon: <Icon icon={Users} />,
          key: 'newGroup',
          label: t('newGroupChat'),
          onClick: handleOpenGroupWizard,
        },
      ].filter(Boolean) as MenuItemType[],
    [t, handleClickMutateAgent, handleOpenGroupWizard],
  );

  if (!showCreateSession) return;

  return (
    <>
      <Dropdown
        menu={{
          items: dropdownItems,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
          },
        }}
        trigger={['click']}
      >
        <ActionIcon
          icon={PlusIcon}
          loading={isValidatingAgent || isCreatingGroup}
          size={'small'}
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
});

export default CreateButton;
