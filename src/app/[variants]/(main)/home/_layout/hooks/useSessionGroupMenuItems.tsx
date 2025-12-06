import { Icon } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { ItemType } from 'antd/es/menu/interface';
import { FolderCogIcon, FolderPenIcon, Trash } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGroupTemplates } from '@/components/ChatGroupWizard/templates';
import { DEFAULT_CHAT_GROUP_CHAT_CONFIG } from '@/const/settings';
import { useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/slices/session/selectors';
import { LobeAgentSession } from '@/types/session';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));

interface HostConfig {
  model?: string;
  provider?: string;
}

/**
 * Hook for generating menu items for session group containers
 * Used in List/Group/Actions.tsx
 */
export const useSessionGroupMenuItems = () => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const { modal, message } = App.useApp();
  const groupTemplates = useGroupTemplates();

  const [removeSessionGroup, createSession, refreshSessions] = useSessionStore((s) => [
    s.removeSessionGroup,
    s.createSession,
    s.refreshSessions,
  ]);
  const [createGroup] = useChatGroupStore((s) => [s.createGroup]);

  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  /**
   * Rename group menu item
   */
  const renameGroupMenuItem = useCallback(
    (onToggleEdit: (visible?: boolean) => void): ItemType => {
      const iconElement = <Icon icon={FolderPenIcon} />;
      return {
        icon: iconElement,
        key: 'rename',
        label: t('sessionGroup.rename'),
        onClick: (info: any) => {
          info.domEvent?.stopPropagation();
          onToggleEdit(true);
        },
      };
    },
    [t],
  );

  /**
   * Config group menu item
   */
  const configGroupMenuItem = useCallback(
    (onOpenConfig: () => void): ItemType => {
      const iconElement = <Icon icon={FolderCogIcon} />;
      return {
        icon: iconElement,
        key: 'config',
        label: t('sessionGroup.config'),
        onClick: (info: any) => {
          info.domEvent?.stopPropagation();
          onOpenConfig();
        },
      };
    },
    [t],
  );

  /**
   * Delete group menu item with confirmation modal
   */
  const deleteGroupMenuItem = useCallback(
    (groupId: string): ItemType => {
      const trashIcon = <Icon icon={Trash} />;
      return {
        danger: true,
        icon: trashIcon,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: (info: any) => {
          info.domEvent?.stopPropagation();
          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: async () => {
              await removeSessionGroup(groupId);
            },
            rootClassName: styles.modalRoot,
            title: t('sessionGroup.confirmRemoveGroupAlert'),
          });
        },
      };
    },
    [t, modal, removeSessionGroup, styles.modalRoot],
  );

  /**
   * Create agent in group menu item
   */
  const createAgentInGroupMenuItem = useCallback(
    (groupId: string, isPinned?: boolean): ItemType => {
      const iconElement = <Icon icon={FolderPenIcon} />;
      return {
        icon: iconElement,
        key: 'createAgent',
        label: t('newAgent'),
        onClick: async (info: any) => {
          info.domEvent?.stopPropagation();

          const key = 'createNewAgent';
          message.loading({ content: t('sessionGroup.creatingAgent'), duration: 0, key });
          setIsCreatingAgent(true);

          try {
            await createSession({
              group: groupId,
              pinned: isPinned,
            });

            message.destroy(key);
            message.success({ content: t('sessionGroup.createAgentSuccess') });
          } catch (error) {
            message.destroy(key);
            message.error({ content: t('sessionGroup.createGroupFailed') });
            throw error;
          } finally {
            setIsCreatingAgent(false);
          }
        },
      };
    },
    [t, message, createSession],
  );

  /**
   * Create group chat in group menu item
   * Opens member selection modal
   */
  const createGroupChatInGroupMenuItem = useCallback(
    (
      groupId: string,
      onOpenMemberSelection: (callbacks: {
        onCancel: () => void;
        onConfirm: (
          selectedAgents: string[],
          hostConfig?: HostConfig,
          enableSupervisor?: boolean,
        ) => Promise<void>;
      }) => void,
    ): ItemType => {
      const iconElement = <Icon icon={FolderPenIcon} />;
      return {
        icon: iconElement,
        key: 'createGroupChat',
        label: t('newGroupChat'),
        onClick: async (info: any) => {
          info.domEvent?.stopPropagation();

          onOpenMemberSelection({
            onCancel: () => {},
            onConfirm: async (selectedAgents, hostConfig, enableSupervisor) => {
              setIsCreatingGroup(true);
              try {
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
                    title: 'New Group Chat',
                  },
                  selectedAgents,
                );
                message.success({ content: t('sessionGroup.createGroupSuccess') });
              } catch (error) {
                console.error('Failed to create group:', error);
                message.error({ content: t('sessionGroup.createGroupFailed') });
              } finally {
                setIsCreatingGroup(false);
              }
            },
          });
        },
      };
    },
    [t, message, createGroup],
  );

  /**
   * Create group from template
   * Internal helper function used by create menu items
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
   * Internal helper function used by create menu items
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

  return {
    configGroupMenuItem,
    createAgentInGroupMenuItem,
    createGroupChatInGroupMenuItem,
    createGroupFromTemplate,
    createGroupWithMembers,
    deleteGroupMenuItem,
    isCreatingAgent,
    isCreatingGroup,
    renameGroupMenuItem,
  };
};
