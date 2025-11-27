'use client';

import { AccordionItem, Dropdown, Text } from '@lobehub/ui';
import React, { Suspense, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useCreateMenuItems } from '@/features/NavPanel/hooks';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import SkeletonList from '../SkeletonList';
import Actions from './Actions';
import List from './List';
import { useAgentModal } from './ModalProvider';
import { useAgentActionsDropdownMenu } from './useDropdownMenu';

interface AgentProps {
  itemKey: string;
}

const Agent = memo<AgentProps>(({ itemKey }) => {
  const { t } = useTranslation('common');
  const { showCreateSession } = useServerConfigStore(featureFlagsSelectors);

  const { openGroupWizardModal, closeGroupWizardModal, openConfigGroupModal } = useAgentModal();

  // Create menu items
  const { createGroupFromTemplate, createGroupWithMembers, isLoading } = useCreateMenuItems();

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

  const handleOpenConfigGroupModal = useCallback(() => {
    openConfigGroupModal();
  }, [openConfigGroupModal]);

  const dropdownMenu = useAgentActionsDropdownMenu({
    handleOpenGroupWizard,
    openConfigGroupModal: handleOpenConfigGroupModal,
  });

  if (!showCreateSession) {
    return (
      <AccordionItem
        itemKey={itemKey}
        paddingBlock={6}
        paddingInline={'8px 6px'}
        title={
          <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
            {t('navPanel.agent', { defaultValue: '助手' })}
          </Text>
        }
      >
        <List />
      </AccordionItem>
    );
  }

  return (
    <AccordionItem
      action={<Actions dropdownMenu={dropdownMenu} isLoading={isLoading} />}
      headerWrapper={(header) => (
        <Dropdown
          menu={{
            items: dropdownMenu,
          }}
          trigger={['contextMenu']}
        >
          {header}
        </Dropdown>
      )}
      itemKey={itemKey}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
          {t('navPanel.agent', { defaultValue: '助手' })}
        </Text>
      }
    >
      <Suspense fallback={<SkeletonList rows={6} />}>
        <Flexbox gap={4} paddingBlock={1}>
          <List />
        </Flexbox>
      </Suspense>
    </AccordionItem>
  );
});

export default Agent;
