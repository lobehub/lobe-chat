import { useCallback, useState } from 'react';

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

export const useGroupCreation = () => {
  const groupTemplates = useGroupTemplates();
  const [createSession, refreshSessions] = useSessionStore((s) => [
    s.createSession,
    s.refreshSessions,
  ]);
  const [createGroup] = useChatGroupStore((s) => [s.createGroup]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

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
        console.log('Creating group with hostConfig:', hostConfig);
        console.log(
          'Mapped config:',
          hostConfig
            ? {
                orchestratorModel: hostConfig.model,
                orchestratorProvider: hostConfig.provider,
              }
            : undefined,
        );

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

        return true;
      } catch (error) {
        console.error('Failed to create group from template:', error);
        return false;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [groupTemplates, createSession, refreshSessions, createGroup],
  );

  const createGroupWithMembers = useCallback(
    async (
      selectedAgents: string[],
      groupTitle: string,
      hostConfig?: HostConfig,
      enableSupervisor?: boolean,
    ) => {
      setIsCreatingGroup(true);
      try {
        console.log('Creating custom group with hostConfig:', hostConfig);
        console.log(
          'Mapped config:',
          hostConfig
            ? {
                orchestratorModel: hostConfig.model,
                orchestratorProvider: hostConfig.provider,
              }
            : undefined,
        );

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
            title: groupTitle,
          },
          selectedAgents,
        );

        return true;
      } catch (error) {
        console.error('Failed to create group:', error);
        return false;
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [createGroup],
  );

  return {
    createGroupFromTemplate,
    createGroupWithMembers,
    isCreatingGroup,
  };
};
