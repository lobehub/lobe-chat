import { clientDB } from '@/database/client/db';
import { ChatGroupModel } from '@/database/models/chatGroup';
import {
  ChatGroupAgentItem,
  ChatGroupItem,
  NewChatGroup,
  NewChatGroupAgent,
} from '@/database/schemas/chatGroup';
import { BaseClientService } from '@/services/baseClientService';

import { IChatGroupService } from './type';

export class ClientService extends BaseClientService implements IChatGroupService {
  private get chatGroupModel(): ChatGroupModel {
    return new ChatGroupModel(clientDB as any, this.userId);
  }

  async createGroup(params: Omit<NewChatGroup, 'userId'>): Promise<ChatGroupItem> {
    return this.chatGroupModel.create(params);
  }

  async updateGroup(id: string, value: Partial<ChatGroupItem>): Promise<ChatGroupItem> {
    return this.chatGroupModel.update(id, value);
  }

  async deleteGroup(id: string): Promise<any> {
    return this.chatGroupModel.delete(id);
  }

  async deleteAllGroups(): Promise<any> {
    return this.chatGroupModel.deleteAll();
  }

  async getGroup(id: string): Promise<ChatGroupItem | undefined> {
    return this.chatGroupModel.findById(id);
  }

  async getGroups(): Promise<ChatGroupItem[]> {
    return this.chatGroupModel.queryWithMemberDetails();
  }

  async addAgentsToGroup(groupId: string, agentIds: string[]): Promise<ChatGroupAgentItem[]> {
    return this.chatGroupModel.addAgentsToGroup(groupId, agentIds);
  }

  async removeAgentsFromGroup(groupId: string, agentIds: string[]): Promise<any> {
    for (const agentId of agentIds) {
      await this.chatGroupModel.removeAgentFromGroup(groupId, agentId);
    }
  }

  async updateAgentInGroup(
    groupId: string,
    agentId: string,
    updates: Partial<Pick<NewChatGroupAgent, 'order' | 'role'>>,
  ): Promise<ChatGroupAgentItem> {
    return this.chatGroupModel.updateAgentInGroup(groupId, agentId, updates);
  }

  async getGroupAgents(groupId: string): Promise<ChatGroupAgentItem[]> {
    return this.chatGroupModel.getGroupAgents(groupId);
  }
}
