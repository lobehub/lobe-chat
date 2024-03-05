import { CreateMessageParams, MessageModel } from '@/database/models/message';
import { DB_Message } from '@/database/schemas/message';
import { ChatMessage, ChatMessageError, ChatPluginPayload } from '@/types/message';

export class MessageService {
  async create(data: CreateMessageParams) {
    const { id } = await MessageModel.create(data);

    return id;
  }

  async batchCreate(messages: ChatMessage[]) {
    return MessageModel.batchCreate(messages);
  }

  async hasMessages() {
    const number = await MessageModel.count();
    return number > 0;
  }

  async messageCountToCheckTrace() {
    const number = await MessageModel.count();
    return number >= 4;
  }

  async getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]> {
    return MessageModel.query({ sessionId, topicId });
  }

  async removeMessage(id: string) {
    return MessageModel.delete(id);
  }

  async getAllMessagesInSession(sessionId: string) {
    return MessageModel.queryBySessionId(sessionId);
  }

  async updateMessageError(id: string, error: ChatMessageError) {
    return MessageModel.update(id, { error });
  }

  async removeMessages(assistantId: string, topicId?: string) {
    return MessageModel.batchDelete(assistantId, topicId);
  }

  async clearAllMessage() {
    return MessageModel.clearTable();
  }

  async bindMessagesToTopic(topicId: string, messageIds: string[]) {
    return MessageModel.batchUpdate(messageIds, { topicId });
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

  async getAllMessages() {
    return MessageModel.queryAll();
  }
}

export const messageService = new MessageService();
