import {
  ChatGroupAgentItem,
  ChatGroupItem,
  NewChatGroup,
  NewChatGroupAgent,
} from '@/database/schemas';
import { lambdaClient } from '@/libs/trpc/client';

class ChatGroupService {
  createGroup = (params: Omit<NewChatGroup, 'userId'>): Promise<ChatGroupItem> => {
    return lambdaClient.group.createGroup.mutate({
      ...params,
      config: params.config as any,
    });
  };

  updateGroup = (id: string, value: Partial<ChatGroupItem>): Promise<ChatGroupItem> => {
    return lambdaClient.group.updateGroup.mutate({
      id,
      value: {
        ...value,
        config: value.config as any,
      },
    });
  };

  deleteGroup = (id: string) => {
    return lambdaClient.group.deleteGroup.mutate({ id });
  };

  getGroup = (id: string): Promise<ChatGroupItem | undefined> => {
    return lambdaClient.group.getGroup.query({ id });
  };

  getGroups = (): Promise<ChatGroupItem[]> => {
    return lambdaClient.group.getGroups.query();
  };

  addAgentsToGroup = (groupId: string, agentIds: string[]): Promise<ChatGroupAgentItem[]> => {
    return lambdaClient.group.addAgentsToGroup.mutate({ agentIds, groupId });
  };

  removeAgentsFromGroup = (groupId: string, agentIds: string[]) => {
    return lambdaClient.group.removeAgentsFromGroup.mutate({ agentIds, groupId });
  };

  updateAgentInGroup = (
    groupId: string,
    agentId: string,
    updates: Partial<Pick<NewChatGroupAgent, 'order' | 'role'>>,
  ): Promise<ChatGroupAgentItem> => {
    return lambdaClient.group.updateAgentInGroup.mutate({
      agentId,
      groupId,
      updates: {
        order: updates.order === null ? undefined : updates.order,
        role: updates.role === null ? undefined : updates.role,
      },
    });
  };

  getGroupAgents = (groupId: string): Promise<ChatGroupAgentItem[]> => {
    return lambdaClient.group.getGroupAgents.query({ groupId });
  };
}

export const chatGroupService = new ChatGroupService();
