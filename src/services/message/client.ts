import { MessageModel } from '@/database/client/models/message';
import { DB_Message } from '@/database/client/schemas/message';
import { ChatMessage, ChatMessageError, ChatPluginPayload } from '@/types/message';

import { CreateMessageParams, IMessageService } from './type';

export class ClientService implements IMessageService {
  async createMessage(data: CreateMessageParams) {
    const { id } = await MessageModel.create(data);

    return id;
  }

  async batchCreateMessages(messages: ChatMessage[]) {
    return MessageModel.batchCreate(messages);
  }

  async getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]> {
    return MessageModel.query({ sessionId, topicId });
  }

  async getAllMessages() {
    return MessageModel.queryAll();
  }

  async countMessages() {
    return MessageModel.count();
  }

  async getAllMessagesInSession(sessionId: string) {
    return MessageModel.queryBySessionId(sessionId);
  }

  async updateMessageError(id: string, error: ChatMessageError) {
    return MessageModel.update(id, { error });
  }

  async updateMessage(id: string, message: Partial<DB_Message>) {
    return MessageModel.update(id, message);
  }

  async updateMessagePlugin(id: string, plugin: ChatPluginPayload) {
    return MessageModel.update(id, { plugin });
  }

  async updateMessagePluginState(id: string, key: string, value: any) {
    return MessageModel.updatePluginState(id, key, value);
  }

  async bindMessagesToTopic(topicId: string, messageIds: string[]) {
    return MessageModel.batchUpdate(messageIds, { topicId });
  }

  async removeMessage(id: string) {
    return MessageModel.delete(id);
  }

  async removeMessages(assistantId: string, topicId?: string) {
    return MessageModel.batchDelete(assistantId, topicId);
  }

  async removeAllMessages() {
    return MessageModel.clearTable();
  }

  async hasMessages() {
    const number = await this.countMessages();
    return number > 0;
  }

  async messageCountToCheckTrace() {
    const number = await this.countMessages();
    return number >= 4;
  }
}
