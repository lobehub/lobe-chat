import { Icon } from '@lobehub/ui';
import { GroupBotSquareIcon } from '@lobehub/ui/icons';
import { App } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import { BotIcon, FileTextIcon, FolderCogIcon, FolderPlus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useGroupTemplates } from '@/components/ChatGroupWizard/templates';
import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { useActionSWR } from '@/libs/swr';
import { GroupMemberConfig, chatGroupService } from '@/services/chatGroup';
import { useAgentStore } from '@/store/agent';
import { useAgentGroupStore } from '@/store/agentGroup';
import { useFileStore } from '@/store/file';
import { useHomeStore } from '@/store/home';

interface HostConfig {
  model?: string;
  provider?: string;
}

interface CreateAgentOptions {
  groupId?: string;
  isPinned?: boolean;
  onSuccess?: () => void;
}

/**
 * Hook for generating menu items for top-level create actions
 * Used in Body/Agent/Actions.tsx and Header/AddButton.tsx
 */
export const useCreateMenuItems = () => {
  const { t } = useTranslation('chat');
  const { t: tFile } = useTranslation('file');
  const { message } = App.useApp();
  const navigate = useNavigate();
  const groupTemplates = useGroupTemplates();

  const [storeCreateAgent] = useAgentStore((s) => [s.createAgent]);
  const [addGroup, refreshAgentList, switchToGroup] = useHomeStore((s) => [
    s.addGroup,
    s.refreshAgentList,
    s.switchToGroup,
  ]);
  const [createGroup, loadGroups] = useAgentGroupStore((s) => [s.createGroup, s.loadGroups]);
  const createNewPage = useFileStore((s) => s.createNewPage);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingSessionGroup, setIsCreatingSessionGroup] = useState(false);

  // SWR-based agent creation with auto navigation to profile
  const { mutate: mutateAgent, isValidating: isValidatingAgent } = useActionSWR(
    'agent.createAgent',
    async () => {
      const result = await storeCreateAgent({});
      navigate(`/agent/${result.agentId}/profile`);
      return result;
    },
    {
      onSuccess: async () => {
        await refreshAgentList();
      },
    },
  );

  /**
   * Create agent action
   */
  const createAgent = useCallback(
    async (options?: CreateAgentOptions) => {
      await mutateAgent();
      options?.onSuccess?.();
    },
    [mutateAgent],
  );

  /**
   * Create group from template
   * Uses backend batch creation for better performance and consistency
   */
  const createGroupFromTemplate = useCallback(
    async (
      templateId: string,
      hostConfig?: HostConfig,
      enableSupervisor?: boolean,
      selectedMemberTitles?: string[],
    ) => {
      setIsCreatingGroup(true);
      try {
        const template = groupTemplates.find((t) => t.id === templateId);
        if (!template) {
          throw new Error(`Template ${templateId} not found`);
        }

        const membersToCreate =
          typeof selectedMemberTitles === 'undefined'
            ? template.members
            : template.members.filter((m) => selectedMemberTitles.includes(m.title));

        // Prepare member configs for batch creation
        const memberConfigs: GroupMemberConfig[] = membersToCreate.map((member) => ({
          avatar: member.avatar,
          backgroundColor: member.backgroundColor,
          plugins: member.plugins,
          systemRole: member.systemRole,
          title: member.title,
        }));

        // Use batch creation endpoint - creates all agents and group in one request
        const { groupId } = await chatGroupService.createGroupWithMembers(
          {
            config: {
              ...(hostConfig
                ? {
                    orchestratorModel: hostConfig.model,
                    orchestratorProvider: hostConfig.provider,
                  }
                : {}),
              enableSupervisor: enableSupervisor ?? true,
              scene: DEFAULT_CHAT_GROUP_CHAT_CONFIG.scene,
            },
            title: template.title,
          },
          memberConfigs,
        );

        // Switch to the new group
        switchToGroup(groupId);

        // Refresh data after creation
        await refreshAgentList();
        await loadGroups();

        return true;
      } catch (error) {
        console.error('Failed to create group from template:', error);
        message.error({ content: t('sessionGroup.createGroupFailed') });
        return false;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [groupTemplates, refreshAgentList, loadGroups, switchToGroup, message, t],
  );

  /**
   * Create group with members
   */
  const createGroupWithMembers = useCallback(
    async (
      selectedAgents: string[],
      groupTitle?: string,
      hostConfig?: HostConfig,
      enableSupervisor?: boolean,
    ) => {
      setIsCreatingGroup(true);
      try {
        const title = groupTitle || t('defaultGroupChat');

        await createGroup(
          {
            config: {
              ...DEFAULT_CHAT_GROUP_CHAT_CONFIG,
              ...(hostConfig
                ? {
                    orchestratorModel: hostConfig.model,
                    orchestratorProvider: hostConfig.provider,
                  }
                : {}),
              enableSupervisor: enableSupervisor ?? true,
            },
            title,
          },
          selectedAgents,
        );

        return true;
      } catch (error) {
        console.error('Failed to create group:', error);
        message.error({ content: t('sessionGroup.createGroupFailed') });
        return false;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [createGroup, message, t],
  );

  /**
   * Create agent menu item
   */
  const createAgentMenuItem = useCallback(
    (options?: CreateAgentOptions): ItemType => ({
      icon: <Icon icon={BotIcon} />,
      key: 'newAgent',
      label: t('newAgent'),
      onClick: async (info) => {
        info.domEvent?.stopPropagation();
        await createAgent(options);
      },
    }),
    [t, createAgent],
  );

  /**
   * Create group chat menu item
   * Opens the group wizard modal
   */
  const createGroupChatMenuItem = useCallback(
    (onOpenWizard: () => void): ItemType => ({
      icon: <Icon icon={GroupBotSquareIcon} />,
      key: 'newGroupChat',
      label: t('newGroupChat'),
      onClick: (info) => {
        info.domEvent?.stopPropagation();
        onOpenWizard();
      },
    }),
    [t],
  );

  /**
   * Add session group menu item
   */
  const createSessionGroupMenuItem = useCallback(
    (): ItemType => ({
      icon: <Icon icon={FolderPlus} />,
      key: 'addSessionGroup',
      label: t('sessionGroup.createGroup'),
      onClick: async (info) => {
        info.domEvent?.stopPropagation();
        setIsCreatingSessionGroup(true);
        await addGroup(t('sessionGroup.newGroup'));
        setIsCreatingSessionGroup(false);
      },
    }),
    [t, addGroup],
  );

  /**
   * Config menu item
   */
  const configMenuItem = useCallback(
    (onOpenConfig: () => void): ItemType => ({
      icon: <Icon icon={FolderCogIcon} />,
      key: 'config',
      label: t('sessionGroup.config'),
      onClick: (info) => {
        info.domEvent?.stopPropagation();
        onOpenConfig();
      },
    }),
    [t],
  );

  /**
   * Create page action
   */
  const createPage = useCallback(() => {
    const untitledTitle = tFile('documentList.untitled');
    createNewPage(untitledTitle);
  }, [createNewPage, tFile]);

  /**
   * Create page menu item
   */
  const createPageMenuItem = useCallback(
    (): ItemType => ({
      icon: <Icon icon={FileTextIcon} />,
      key: 'newPage',
      label: t('newPage'),
      onClick: (info) => {
        info.domEvent?.stopPropagation();
        createPage();
      },
    }),
    [t, createPage],
  );

  return {
    configMenuItem,
    createAgent,
    createAgentMenuItem,
    createGroupChatMenuItem,
    createGroupFromTemplate,
    createGroupWithMembers,
    createPage,
    createPageMenuItem,
    createSessionGroupMenuItem,

    // Loading states
    isCreatingGroup,
    isCreatingSessionGroup,
    isLoading: isValidatingAgent || isCreatingGroup || isCreatingSessionGroup,
    isValidatingAgent,
  };
};
