import { App } from 'antd';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGroupTemplates } from '@/components/ChatGroupWizard/templates';
import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { LobeAgentSession } from '@/types/session';

interface HostConfig {
  model?: string;
  provider?: string;
}

interface CreateGroupOptions {
  onSuccess?: () => void;
}

/**
 * Unified hook for all group creation operations
 * Handles both template-based and custom group creation with proper feedback
 */
export const useGroupActions = (options?: CreateGroupOptions) => {
  const { t } = useTranslation('chat');
  const { message } = App.useApp();
  const groupTemplates = useGroupTemplates();

  const [createSession, refreshSessions] = useSessionStore((s) => [
    s.createSession,
    s.refreshSessions,
  ]);
  const [createGroup] = useChatGroupStore((s) => [s.createGroup]);

  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Create a group from a predefined template
   */
  const createGroupFromTemplate = useCallback(
    async (
      templateId: string,
      hostConfig?: HostConfig,
      enableSupervisor?: boolean,
      selectedMemberTitles?: string[],
    ) => {
      setIsCreating(true);
      try {
        const template = groupTemplates.find((t) => t.id === templateId);
        if (!template) {
          throw new Error(`Template ${templateId} not found`);
        }

        // Determine which members to create based on selection
        const membersToCreate =
          typeof selectedMemberTitles === 'undefined'
            ? template.members
            : template.members.filter((m) => selectedMemberTitles.includes(m.title));

        // Create assistants for each selected member and get their agent IDs
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
            false, // Don't switch to each session
          );

          // Refresh sessions to ensure we get the latest data
          await refreshSessions();

          // Get the agent ID from the created session
          const session = sessionSelectors.getSessionById(sessionId)(useSessionStore.getState());
          if (session && session.type === 'agent') {
            const agentSession = session as LobeAgentSession;
            if (agentSession.config?.id) {
              memberAgentIds.push(agentSession.config.id);
            }
          }
        }

        // Wait 1 second delay between member creation and group creation
        await new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 1000);
        });

        // Create the group with the agent IDs and host configuration
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

        setIsModalOpen(false);
        message.success({ content: t('sessionGroup.createGroupSuccess') });
        options?.onSuccess?.();
        return true;
      } catch (error) {
        console.error('Failed to create group from template:', error);
        message.error({ content: t('sessionGroup.createGroupFailed') });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [groupTemplates, createSession, refreshSessions, createGroup, message, t, options],
  );

  /**
   * Create a custom group with selected members
   */
  const createGroupWithMembers = useCallback(
    async (
      selectedAgents: string[],
      groupTitle?: string,
      hostConfig?: HostConfig,
      enableSupervisor?: boolean,
    ) => {
      setIsCreating(true);
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

        setIsModalOpen(false);
        message.success({ content: t('sessionGroup.createGroupSuccess') });
        options?.onSuccess?.();
        return true;
      } catch (error) {
        console.error('Failed to create group:', error);
        message.error({ content: t('sessionGroup.createGroupFailed') });
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [createGroup, message, t, options],
  );

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    closeModal,
    // Creation methods
    createGroupFromTemplate,

    createGroupWithMembers,

    // Loading state
    isCreating,

    // Modal state
    isModalOpen,

    openModal,
  };
};
