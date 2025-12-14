'use client';

import type { AgentItem } from '@lobechat/types';
import { ActionIcon, SortableList } from '@lobehub/ui';
import { UserMinus, UserPlus } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR, DEFAULT_SUPERVISOR_AVATAR } from '@/const/meta';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';
import { useChatStore } from '@/store/chat';

import AddGroupMemberModal from '../AddGroupMemberModal';
import AgentProfilePopup from './AgentProfilePopup';
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
  const groupConfig = useAgentGroupStore(agentGroupSelectors.getGroupConfig(groupId || ''));

  // Get members from store (excluding supervisor)
  const groupMembers = useAgentGroupStore(agentGroupSelectors.getGroupMembers(groupId || ''));

  const [enablingSupervisor, setEnablingSupervisor] = useState(false);

  // const [agentSettingsOpen, setAgentSettingsOpen] = useState(false);
  // const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();

  const handleAddMembers = async (selectedAgents: string[]) => {
    if (!groupId) {
      console.error('No active group to add members to');
      return;
    }

    if (selectedAgents.length > 0) {
      await addAgentsToGroup(groupId, selectedAgents);
    }

    onAddModalOpenChange(false);
  };

  // Use members from store as the initial local state
  const [members, setMembers] = useState<AgentItem[]>(groupMembers);

  const [removingMemberIds, setRemovingMemberIds] = useState<string[]>([]);

  const withRemovingFlag = async (id: string, task: () => Promise<void>) => {
    setRemovingMemberIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    try {
      await task();
    } finally {
      setRemovingMemberIds((prev) => prev.filter((memberId) => memberId !== id));
    }
  };

  // Sync local state with store when groupMembers changes
  useEffect(() => {
    setMembers(groupMembers);
  }, [groupMembers]);

  const handleRemoveMember = async (memberId: string) => {
    if (!groupId) return;

    await withRemovingFlag(memberId, () => removeAgentFromGroup(groupId, memberId));
  };

  const handleMemberClick = (agentId: string) => {
    toggleThread(agentId);
    togglePortal(true);
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
      <Flexbox gap={2}>
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
            id={'orchestrator'}
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
              <AgentProfilePopup agent={item} onChat={() => handleMemberClick(item.id)}>
                <GroupMemberItem
                  actions={
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
                  }
                  avatar={item.avatar || DEFAULT_AVATAR}
                  background={item.backgroundColor ?? undefined}
                  id={item.id}
                  title={item.title || t('defaultSession', { ns: 'common' })}
                />
              </AgentProfilePopup>
            )}
            style={{ margin: 0 }}
          />
        )}
      </Flexbox>

      {groupId && (
        <AddGroupMemberModal
          existingMembers={groupMembers.map((member) => member.id)}
          groupId={groupId}
          onCancel={() => onAddModalOpenChange(false)}
          onConfirm={handleAddMembers}
          open={addModalOpen}
        />
      )}
    </>
  );
});

export default GroupMember;
