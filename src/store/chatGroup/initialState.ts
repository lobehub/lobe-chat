import type { ChatGroupItem, NewChatGroup } from '@/database/schemas/chatGroup';
import type { LobeChatGroupConfig } from '@/types/chatGroup';

export interface ChatGroupState {
  activeThreadAgentId: string;
  groupMap: Record<string, ChatGroupItem>;
  groups: ChatGroupItem[];
  groupsInit: boolean;
  isGroupsLoading: boolean;
  showGroupSetting: boolean;
}

// Forward declaration for actions to avoid circular dependency
export interface ChatGroupAction {
  addAgentsToGroup: (groupId: string, agentIds: string[]) => Promise<void>;
  createGroup: (group: Omit<NewChatGroup, 'userId'>, agentIds?: string[]) => Promise<string>;
  deleteGroup: (id: string) => Promise<void>;
  internal_dispatchChatGroup: (
    payload:
      | {
          type: string;
        }
      | {
          payload: any;
          type: string;
        },
  ) => void;
  internal_refreshGroups: () => Promise<void>;
  internal_updateGroupMaps: (groups: ChatGroupItem[]) => void;
  loadGroups: () => Promise<void>;
  pinGroup: (id: string, pinned: boolean) => Promise<void>;
  refreshGroupDetail: (groupId: string) => Promise<void>;
  refreshGroups: () => Promise<void>;
  removeAgentFromGroup: (groupId: string, agentId: string) => Promise<void>;
  reorderGroupMembers: (groupId: string, orderedAgentIds: string[]) => Promise<void>;
  toggleGroupSetting: (open: boolean) => void;
  toggleThread: (agentId: string) => void;
  updateGroup: (id: string, value: Partial<ChatGroupItem>) => Promise<void>;
  updateGroupConfig: (config: Partial<LobeChatGroupConfig>) => Promise<void>;
  updateGroupMeta: (meta: Partial<ChatGroupItem>) => Promise<void>;
  useFetchGroupDetail: (enabled: boolean, groupId: string) => any;
  useFetchGroups: (enabled: boolean, isLogin: boolean) => any;
}

export type ChatGroupStore = ChatGroupState & ChatGroupAction;

export const initialChatGroupState: ChatGroupState = {
  activeThreadAgentId: '',
  groupMap: {},
  groups: [],
  groupsInit: false,
  isGroupsLoading: true,
  showGroupSetting: false,
};
