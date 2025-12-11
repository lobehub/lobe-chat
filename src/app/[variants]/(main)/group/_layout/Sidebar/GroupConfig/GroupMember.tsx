'use client';

import type { AgentItem } from '@lobechat/types';
import { ActionIcon, SortableList } from '@lobehub/ui';
import { Settings, UserMinus, UserPlus } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MemberSelectionModal } from '@/components/MemberSelectionModal';
import { DEFAULT_AVATAR, DEFAULT_SUPERVISOR_AVATAR } from '@/const/meta';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import GroupMemberItem from './GroupMemberItem';

interface GroupMemberProps {
  addModalOpen: boolean;
  groupId?: string;
  onAddModalOpenChange: (open: boolean) => void;
}

/**
 * Group member info in Sidebar
 */
const GroupMember = memo<GroupMemberProps>(({ addModalOpen, onAddModalOpenChange, groupId }) => {
  const { t } = useTranslation('chat');

  const addAgentsToGroup = useAgentGroupStore((s) => s.addAgentsToGroup);
  const removeAgentFromGroup = useAgentGroupStore((s) => s.removeAgentFromGroup);
  const persistReorder = useAgentGroupStore((s) => s.reorderGroupMembers);
  const toggleThread = useAgentGroupStore((s) => s.toggleThread);
  const updateGroupConfig = useAgentGroupStore((s) => s.updateGroupConfig);
  const togglePortal = useChatStore((s) => s.togglePortal);
  const cancelSupervisorDecision = useChatStore((s) => s.internal_cancelSupervisorDecision);
  const triggerSupervisorDecision = useChatStore((s) => s.internal_triggerSupervisorDecision);

  const isSupervisorLoading = useChatStore(chatSelectors.isSupervisorLoading(groupId || ''));
  const groupConfig = useAgentGroupStore(agentGroupSelectors.getGroupConfig(groupId || ''));

  // Get agents from store using the new selector
  const groupAgents = useAgentGroupStore(agentGroupSelectors.getGroupAgents(groupId || ''));

  const [enablingSupervisor, setEnablingSupervisor] = useState(false);

  // const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  // const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();

  const handleAddMembers = async (
    selectedAgents: string[],
    hostConfig?: { model?: string; provider?: string },
    enableSupervisor?: boolean,
  ) => {
    if (!groupId) {
      console.error('No active group to add members to');
      return;
    }

    // Update host config if changed
    if (hostConfig !== undefined || enableSupervisor !== undefined) {
      const newConfig: any = {};

      if (enableSupervisor !== undefined) {
        newConfig.enableSupervisor = enableSupervisor;
      }

      if (hostConfig) {
        newConfig.orchestratorModel = hostConfig.model;
        newConfig.orchestratorProvider = hostConfig.provider;
      }

      if (Object.keys(newConfig).length > 0) {
        await updateGroupConfig(newConfig);
      }
    }

    // Add selected agents
    if (selectedAgents.length > 0) {
      await addAgentsToGroup(groupId, selectedAgents);
    }

    onAddModalOpenChange(false);
  };

  // Use agents from store as the initial members
  const [members, setMembers] = useState<AgentItem[]>(groupAgents);

  const [removingMemberIds, setRemovingMemberIds] = useState<string[]>([]);

  const withRemovingFlag = async (id: string, task: () => Promise<void>) => {
    setRemovingMemberIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    try {
      await task();
    } finally {
      setRemovingMemberIds((prev) => prev.filter((memberId) => memberId !== id));
    }
  };

  // Sync local state with store when groupAgents changes
  useEffect(() => {
    setMembers(groupAgents);
  }, [groupAgents]);

  const handleRemoveMember = async (memberId: string) => {
    if (!groupId) return;

    await withRemovingFlag(memberId, () => removeAgentFromGroup(groupId, memberId));
  };

  const handleMemberClick = (agentId: string) => {
    toggleThread(agentId);
    togglePortal(true);
  };

  // const handleOpenMemberSettings = (agentId: string) => {
  //   setSelectedAgentId(agentId);
  //   setAgentSettingsOpen(true);
  // };
  //
  // const handleAgentSettingsClose = () => {
  //   setAgentSettingsOpen(false);
  //   setSelectedAgentId(undefined);
  // };

  const handleStopSupervisor = () => {
    if (!groupId) return;
    cancelSupervisorDecision(groupId);
  };

  const handleTriggerSupervisor = () => {
    if (!groupId) return;
    // Manual trigger: topicId stays current (undefined), flag manual=true
    triggerSupervisorDecision(groupId, undefined, true);
  };

  const handleEnableSupervisor = async () => {
    setEnablingSupervisor(true);
    try {
      await updateGroupConfig({ enableSupervisor: true });
    } finally {
      setEnablingSupervisor(false);
    }
  };

  return (
    <>
      <Flexbox gap={2} padding={6}>
        {/* Supervisor */}
        {groupConfig?.enableSupervisor ? (
          <GroupMemberItem
            actions={
              <ActionIcon
                danger
                icon={UserMinus}
                loading={removingMemberIds.includes('orchestrator')}
                onClick={(e) => {
                  e.stopPropagation();
                  void withRemovingFlag('orchestrator', () =>
                    updateGroupConfig({ enableSupervisor: false }),
                  );
                }}
                size={'small'}
                title={t('groupSidebar.members.removeMember')}
              />
            }
            avatar={DEFAULT_SUPERVISOR_AVATAR}
            generating={isSupervisorLoading}
            generatingTooltip={t('groupSidebar.members.orchestratorThinking')}
            id={'orchestrator'}
            onStopGenerating={handleStopSupervisor}
            onStopGeneratingTooltip={t('groupSidebar.members.stopOrchestrator')}
            onTriggerSupervisor={handleTriggerSupervisor}
            onTriggerSupervisorTooltip={t('groupSidebar.members.triggerOrchestrator')}
            pin
            showActionsOnHover={true}
            title={t('groupSidebar.members.orchestrator')}
          />
        ) : (
          <GroupMemberItem
            actions={
              <ActionIcon
                icon={UserPlus}
                loading={enablingSupervisor}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnableSupervisor();
                }}
                size={'small'}
                title={t('groupSidebar.members.enableOrchestrator')}
              />
            }
            avatar={DEFAULT_SUPERVISOR_AVATAR}
            id={'orchestrator-disabled'}
            pin
            showActionsOnHover={false}
            title={t('groupSidebar.members.orchestrator')}
          />
        )}

        {Boolean(members && members.length > 0) && (
          <SortableList
            gap={2}
            items={members}
            onChange={async (items: AgentItem[]) => {
              setMembers(items);
              if (!groupId) return;
              const orderedIds = items.map((m) => m.id);
              persistReorder(groupId, orderedIds).catch(() => {
                console.error('Failed to persist reorder');
              });
            }}
            renderItem={(item: AgentItem) => (
              <GroupMemberItem
                actions={
                  <>
                    <ActionIcon
                      icon={Settings}
                      onClick={(e) => {
                        e.stopPropagation();
                        // handleOpenMemberSettings(item.id);
                      }}
                      size={'small'}
                      title={t('groupSidebar.members.memberSettings')}
                    />
                    <ActionIcon
                      danger
                      icon={UserMinus}
                      loading={removingMemberIds.includes(item.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(item.id);
                      }}
                      size={'small'}
                      title={t('groupSidebar.members.removeMember')}
                    />
                  </>
                }
                avatar={item.avatar || DEFAULT_AVATAR}
                background={item.backgroundColor ?? undefined}
                id={item.id}
                onClick={() => handleMemberClick(item.id)}
                title={item.title || t('defaultSession', { ns: 'common' })}
              />
            )}
            style={{ margin: 0 }}
          />
        )}
      </Flexbox>

      <MemberSelectionModal
        currentHostConfig={{
          enableSupervisor: groupConfig?.enableSupervisor,
          orchestratorModel: groupConfig?.orchestratorModel,
          orchestratorProvider: groupConfig?.orchestratorProvider,
        }}
        existingMembers={groupAgents.map((agent) => agent.id)}
        groupId={groupId}
        mode="add"
        onCancel={() => onAddModalOpenChange(false)}
        onConfirm={handleAddMembers}
        open={addModalOpen}
      />
    </>
  );
});

export default GroupMember;
