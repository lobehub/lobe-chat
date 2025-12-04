import { Dropdown, Icon, type MenuProps } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import { ChevronDownIcon, FileTextIcon, SquarePenIcon } from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatGroupWizard } from '@/components/ChatGroupWizard';
import { useFileStore } from '@/store/file';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { useCreateMenuItems } from '../../../../../../../features/NavPanel/hooks';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    cursor: pointer;
    user-select: none;

    display: inline-flex;
    gap: 0;
    align-items: center;
    justify-content: center;

    padding: 0;
    border: none;
    border-radius: ${token.borderRadius}px;

    color: ${token.colorTextSecondary};

    background: transparent;

    transition: background-color ${token.motionDurationMid};

    &:hover {
      background-color: ${token.colorFillTertiary};
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    .main-icon {
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 4px;
      border-radius: ${token.borderRadiusSM}px;
      border-start-end-radius: 0;
      border-end-end-radius: 0;

      transition: background-color ${token.motionDurationMid};
    }

    .chevron-icon {
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;

      margin-inline-start: -2px;
      padding-block: 4px;
      padding-inline: 2px;
      border-radius: ${token.borderRadiusSM}px;
      border-start-start-radius: 0;
      border-end-start-radius: 0;

      transition: background-color ${token.motionDurationMid};
    }

    .main-icon:hover {
      background-color: ${token.colorFillSecondary};
    }

    .chevron-icon:hover {
      background-color: ${token.colorFillSecondary};
    }
  `,
}));

const AddButton = memo(() => {
  const { t: tChat } = useTranslation('chat');
  const { t: tFile } = useTranslation('file');
  const { showCreateSession, enableGroupChat } = useServerConfigStore(featureFlagsSelectors);
  const createNewPage = useFileStore((s) => s.createNewPage);
  const { styles } = useStyles();
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
        icon: <Icon color={theme.colorIcon} icon={FileTextIcon} />,
        key: 'newPage',
        label: tChat('newPage'),
        onClick: () => handleCreatePage(),
      },
    ].filter(Boolean);
    return items as MenuProps['items'];
  }, [
    createAgentMenuItem,
    createGroupChatMenuItem,
    enableGroupChat,
    openModal,
    handleCreatePage,
    tChat,
    theme.colorIcon,
  ]);

  if (!showCreateSession) return;

  return (
    <>
      <Dropdown menu={{ items: dropdownItems || [] }} trigger={['click']}>
        <button
          className={styles.button}
          disabled={isValidatingAgent || isCreatingGroup}
          style={{ flex: 'none' }}
          title={tChat('newAgent')}
          type="button"
        >
          <span className="main-icon" onClick={handleMainIconClick}>
            <Icon color={theme.colorIcon} icon={SquarePenIcon} size={18} />
          </span>
          <span className="chevron-icon">
            <Icon color={theme.colorIcon} icon={ChevronDownIcon} size={14} />
          </span>
        </button>
      </Dropdown>
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
