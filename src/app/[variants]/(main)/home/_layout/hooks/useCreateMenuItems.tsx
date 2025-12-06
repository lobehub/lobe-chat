import { Icon } from '@lobehub/ui';
import { GroupBotSquareIcon } from '@lobehub/ui/icons';
import { App } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import { BotIcon, FileTextIcon, FolderCogIcon, FolderPlus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGroupTemplates } from '@/components/ChatGroupWizard/templates';
import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { useActionSWR } from '@/libs/swr';
import { useChatGroupStore } from '@/store/chatGroup';
import { useFileStore } from '@/store/file';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { LobeAgentSession } from '@/types/session';

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
  const groupTemplates = useGroupTemplates();

  const [createSession, addSessionGroup, refreshSessions] = useSessionStore((s) => [
    s.createSession,
    s.addSessionGroup,
    s.refreshSessions,
  ]);
  const [createGroup] = useChatGroupStore((s) => [s.createGroup]);
  const createNewPage = useFileStore((s) => s.createNewPage);

  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingSessionGroup, setIsCreatingSessionGroup] = useState(false);

  // SWR-based agent creation for simple cases
  const { mutate: mutateAgent, isValidating: isValidatingAgent } = useActionSWR(
    'session.createSession',
    (data?: Partial<LobeAgentSession>) => createSession(data),
  );

  /**
   * Create agent action
   * Supports both simple creation (SWR) and advanced with group/pin options
   */
  const createAgent = useCallback(
    async (options?: CreateAgentOptions) => {
      // Simple creation without group/pin options - use SWR
      if (!options?.groupId && !options?.isPinned) {
        await mutateAgent();
        options?.onSuccess?.();
        return;
      }

      // Advanced creation with group/pin options
      const key = 'createNewAgent';
      message.loading({ content: t('sessionGroup.creatingAgent'), duration: 0, key });
      setIsCreatingAgent(true);

      try {
        await createSession({
          group: options.groupId,
          pinned: options.isPinned,
        });

        message.destroy(key);
        message.success({ content: t('sessionGroup.createAgentSuccess') });
        options?.onSuccess?.();
      } catch (error) {
        message.destroy(key);
        message.error({ content: t('sessionGroup.createGroupFailed') });
        throw error;
      } finally {
        setIsCreatingAgent(false);
      }
    },
    [createSession, mutateAgent, message, t],
  );

  /**
   * Create group from template
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

        const memberAgentIds: string[] = [];
        for (const member of membersToCreate) {
          const sessionId = await createSession(
            {
              config: {
                plugins: member.plugins,
                systemRole: member.systemRole,
                virtual: true,
              },
              meta: {
                avatar: member.avatar,
                backgroundColor: member.backgroundColor,
                description: `${member.title} - ${template.description}`,
                title: member.title,
              },
            },
            false,
          );

          await refreshSessions();

          const session = sessionSelectors.getSessionById(sessionId)(useSessionStore.getState());
          if (session && session.type === 'agent') {
            const agentSession = session as LobeAgentSession;
            if (agentSession.config?.id) {
              memberAgentIds.push(agentSession.config.id);
            }
          }
        }

        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 1000);
        });

        await createGroup(
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
          memberAgentIds,
        );

        message.success({ content: t('sessionGroup.createGroupSuccess') });
        return true;
      } catch (error) {
        console.error('Failed to create group from template:', error);
        message.error({ content: t('sessionGroup.createGroupFailed') });
        return false;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [groupTemplates, createSession, refreshSessions, createGroup, message, t],
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
              ...(hostConfig
                ? {
                    orchestratorModel: hostConfig.model,
                    orchestratorProvider: hostConfig.provider,
                  }
                : {}),
              enableSupervisor: enableSupervisor ?? true,
              scene: DEFAULT_CHAT_GROUP_CHAT_CONFIG.scene,
            },
            title,
          },
          selectedAgents,
        );

        message.success({ content: t('sessionGroup.createGroupSuccess') });
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
        await addSessionGroup(t('sessionGroup.newGroup'));
        setIsCreatingSessionGroup(false);
      },
    }),
    [t, addSessionGroup],
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
    isCreatingAgent,
    isCreatingGroup,
    isCreatingSessionGroup,
    isLoading: isValidatingAgent || isCreatingAgent || isCreatingGroup || isCreatingSessionGroup,
    isValidatingAgent,
  };
};
