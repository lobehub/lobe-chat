import { ChatGroupAgentItem, ChatGroupItem, NewChatGroup } from '@/database/schemas/chatGroup';
import { lambdaClient } from '@/libs/trpc/client';

import { IChatGroupService } from './type';

export class ServerService implements IChatGroupService {
  // Group management
  createGroup(params: Omit<NewChatGroup, 'userId'>): Promise<ChatGroupItem> {
    return lambdaClient.group.createGroup.mutate(params);
  }

  updateGroup(id: string, value: Partial<ChatGroupItem>): Promise<ChatGroupItem> {
    return lambdaClient.group.updateGroup.mutate({ id, value });
  }

  deleteGroup(id: string): Promise<any> {
    return lambdaClient.group.deleteGroup.mutate({ id });
  }

  getGroup(id: string): Promise<ChatGroupItem | undefined> {
    return lambdaClient.group.getGroup.query({ id });
  }

  getGroups(): Promise<ChatGroupItem[]> {
    return lambdaClient.group.getGroups.query();
  }

  addAgentsToGroup(groupId: string, agentIds: string[]): Promise<ChatGroupAgentItem[]> {
    return lambdaClient.group.addAgentsToGroup.mutate({ agentIds, groupId });
  }

  removeAgentsFromGroup(groupId: string, agentIds: string[]): Promise<any> {
    return lambdaClient.group.removeAgentsFromGroup.mutate({ agentIds, groupId });
  }

  updateAgentInGroup(
    groupId: string,
    agentId: string,
    updates: Partial<Pick<ChatGroupAgentItem, 'enabled' | 'order' | 'role'>>,
  ): Promise<ChatGroupAgentItem> {
    return lambdaClient.group.updateAgentInGroup.mutate({
      agentId,
      groupId,
      updates,
    });
  }

  getGroupAgents(groupId: string): Promise<ChatGroupAgentItem[]> {
    return lambdaClient.group.getGroupAgents.query({ groupId });
  }
}
