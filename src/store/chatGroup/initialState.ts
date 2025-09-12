import { ChatGroupItem } from '@/database/schemas';

export interface ChatGroupState {
  activeThreadAgentId: string;
  groupMap: Record<string, ChatGroupItem>;
  groups: ChatGroupItem[];
  groupsInit: boolean;
  isGroupsLoading: boolean;
  showGroupSetting: boolean;
}

export const initialChatGroupState: ChatGroupState = {
  activeThreadAgentId: '',
  groupMap: {},
  groups: [],
  groupsInit: false,
  isGroupsLoading: true,
  showGroupSetting: false,
};
