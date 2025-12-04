import { ActionIcon, Icon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { useTheme } from 'antd-style';
import { ChevronDownIcon, FileTextIcon, PlusSquareIcon } from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useFileStore } from '@/store/file';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useCreateMenuItems } from '../../hooks';

const AddButton = memo(() => {
  const { t: tChat } = useTranslation('chat');
  const { t: tFile } = useTranslation('file');
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);
  const createNewPage = useFileStore((s) => s.createNewPage);

  const theme = useTheme();

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
        tChat('defaultGroupChat'),
        hostConfig,
        enableSupervisor,
      );
      closeModal();
    },
    [createGroupWithMembers, tChat, closeModal],
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

  const handleCreatePage = useCallback(() => {
    const untitledTitle = tFile('documentList.untitled');
    createNewPage(untitledTitle);
  }, [createNewPage, tFile]);

  const handleMainIconClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      createAgent();
    },
    [createAgent],
  );

  const dropdownItems = useMemo(() => {
    const items = [
      createAgentMenuItem(),
      enableGroupChat ? createGroupChatMenuItem(openModal) : null,
      {
        icon: <Icon icon={FileTextIcon} />,
        key: 'newPage',
        label: tChat('newPage'),
        onClick: () => handleCreatePage(),
      },
    ].filter(Boolean);
    return items as any;
  }, [
    createAgentMenuItem,
    createGroupChatMenuItem,
    enableGroupChat,
    openModal,
    handleCreatePage,
    tChat,
  ]);

  if (!showCreateSession) return;

  return (
    <>
      <Flexbox horizontal>
        <ActionIcon
          icon={PlusSquareIcon}
          loading={isValidatingAgent || isCreatingGroup}
          onClick={handleMainIconClick}
          size={DESKTOP_HEADER_ICON_SIZE}
          title={tChat('newAgent')}
        />
        <Dropdown menu={{ items: dropdownItems || [] }}>
          <ActionIcon
            color={theme.colorTextQuaternary}
            icon={ChevronDownIcon}
            size={{ blockSize: 32, size: 14 }}
            style={{
              width: 16,
            }}
            tooltipProps={{
              placement: 'right',
            }}
          />
        </Dropdown>
      </Flexbox>
      {enableGroupChat && (
        <ChatGroupWizard
          isCreatingFromTemplate={isCreatingGroup}
          onCancel={closeModal}
          onCreateCustom={handleCreateGroupWithMembers}
          onCreateFromTemplate={handleCreateGroupFromTemplate}
          open={isModalOpen}
        />
      )}
    </>
  );
});

export default AddButton;
