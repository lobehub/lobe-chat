import type { NewChatGroup } from '@lobechat/types';
import { StateCreator } from 'zustand/vanilla';

import { INBOX_SESSION_ID } from '@/const/session';
import { chatGroupService } from '@/services/chatGroup';
import { ChatGroupStore } from '@/store/agentGroup/store';
import { getSessionStoreState } from '@/store/session';

export interface ChatGroupLifecycleAction {
  createGroup: (
    group: Omit<NewChatGroup, 'userId'>,
    agentIds?: string[],
    silent?: boolean,
  ) => Promise<string>;
  deleteGroup: (id: string) => Promise<void>;
}

export const chatGroupLifecycleSlice: StateCreator<
  ChatGroupStore,
  [['zustand/devtools', never]],
  [],
  ChatGroupLifecycleAction
> = (_, get) => ({
  /**
   * @param silent - if true, do not switch to the new group session
   */
  createGroup: async (newGroup, agentIds, silent = false) => {
    const { switchSession } = getSessionStoreState();

    const { group } = await chatGroupService.createGroup(newGroup);

    if (agentIds && agentIds.length > 0) {
      await chatGroupService.addAgentsToGroup(group.id, agentIds);

      // Wait a brief moment to ensure database transactions are committed
      // This prevents race condition where loadGroups() executes before member addition is fully persisted
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });
    }

    get().internal_dispatchChatGroup({ payload: group, type: 'addGroup' });

    await get().loadGroups();
    await getSessionStoreState().refreshSessions();

    if (!silent) {
      switchSession(group.id);
    }

    return group.id;
  },

  deleteGroup: async (id) => {
    // First, get all group members to identify virtual members
    // Note: ChatGroupAgentItem type is incorrectly defined in schema as agents table type
    // but getGroupAgents actually returns chatGroupsAgents junction table entries
    const groupAgents = (await chatGroupService.getGroupAgents(id)) as unknown as Array<{
      agentId: string;
      chatGroupId: string;
    }>;

    // Delete the group first (this will cascade delete the chat_groups_agents entries)
    await chatGroupService.deleteGroup(id);
    get().internal_dispatchChatGroup({ payload: id, type: 'deleteGroup' });

    // Now delete virtual members (agents with virtual: true)
    const sessionStore = getSessionStoreState();
    const sessions = sessionStore.sessions || [];

    // Find and delete all virtual sessions that were members of this group
    const virtualMemberDeletions = groupAgents
      .map((groupAgent) => {
        // groupAgent has agentId property from the junction table
        const session = sessions.find((s) => {
          // Type guard: check if it's an agent session
          if (s.type === 'agent') {
            return s.config?.id === groupAgent.agentId;
          }
          return false;
        });

        // Only delete if the session exists and has virtual flag set to true
        if (session && session.type === 'agent' && session.config?.virtual) {
          return sessionStore.removeSession(session.id);
        }
        return null;
      })
      .filter(Boolean);

    // Wait for all virtual member deletions to complete
    await Promise.all(virtualMemberDeletions);

    await get().loadGroups();
    await getSessionStoreState().refreshSessions();

    // If the active session is the deleted group, switch to the inbox session
    if (sessionStore.activeId === id) {
      sessionStore.switchSession(INBOX_SESSION_ID);
    }
  },
});
