import {
  ChatGroupAgentItem,
  ChatGroupItem,
  NewChatGroup,
  NewChatGroupAgent,
} from '@/database/schemas';

export interface IChatGroupService {
  addAgentsToGroup(groupId: string, agentIds: string[]): Promise<ChatGroupAgentItem[]>;
  createGroup(params: Omit<NewChatGroup, 'userId'>): Promise<ChatGroupItem>;
  deleteGroup(id: string): Promise<any>;
  getGroup(id: string): Promise<ChatGroupItem | undefined>;
  getGroupAgents(groupId: string): Promise<ChatGroupAgentItem[]>;
  getGroups(): Promise<ChatGroupItem[]>;
  removeAgentsFromGroup(groupId: string, agentIds: string[]): Promise<any>;
  updateAgentInGroup(
    groupId: string,
    agentId: string,
    updates: Partial<Pick<NewChatGroupAgent, 'order' | 'role'>>,
  ): Promise<ChatGroupAgentItem>;
  updateGroup(id: string, value: Partial<ChatGroupItem>): Promise<ChatGroupItem>;
}
