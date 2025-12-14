import { StateCreator } from 'zustand/vanilla';

import { chatGroupService } from '@/services/chatGroup';
import { ChatGroupStore } from '@/store/agentGroup/store';

export interface ChatGroupMemberAction {
  addAgentsToGroup: (groupId: string, agentIds: string[]) => Promise<void>;
  removeAgentFromGroup: (groupId: string, agentId: string) => Promise<void>;
  reorderGroupMembers: (groupId: string, orderedAgentIds: string[]) => Promise<void>;
}

export const chatGroupMemberSlice: StateCreator<
  ChatGroupStore,
  [['zustand/devtools', never]],
  [],
  ChatGroupMemberAction
> = (_, get) => ({
  addAgentsToGroup: async (groupId, agentIds) => {
    await chatGroupService.addAgentsToGroup(groupId, agentIds);
    await get().refreshGroupDetail(groupId);
  },

  removeAgentFromGroup: async (groupId, agentId) => {
    await chatGroupService.removeAgentsFromGroup(groupId, [agentId]);
    await get().refreshGroupDetail(groupId);
  },

  reorderGroupMembers: async (groupId, orderedAgentIds) => {
    console.log('REORDER GROUP MEMBERS', groupId, orderedAgentIds);

    await Promise.all(
      orderedAgentIds.map((agentId, index) =>
        chatGroupService.updateAgentInGroup(groupId, agentId, { order: index }),
      ),
    );

    await get().refreshGroupDetail(groupId);
  },
});
