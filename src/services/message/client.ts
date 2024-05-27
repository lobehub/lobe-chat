import dayjs from 'dayjs';

import { MessageModel } from '@/database/client/models/message';
import { DB_Message } from '@/database/client/schemas/message';
import { ChatMessage, ChatMessageError, ChatTTS, ChatTranslate } from '@/types/message';

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

  async countTodayMessages() {
    const topics = await MessageModel.queryAll();
    return topics.filter(
      (item) => dayjs(item.createdAt).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
    ).length;
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

  async updateMessageTTS(id: string, tts: Partial<ChatTTS> | false) {
    return MessageModel.update(id, { tts });
  }

  async updateMessageTranslate(id: string, translate: Partial<ChatTranslate> | false) {
    return MessageModel.update(id, { translate });
  }

  async updateMessagePluginState(id: string, value: Record<string, any>) {
    return MessageModel.updatePluginState(id, value);
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
}
