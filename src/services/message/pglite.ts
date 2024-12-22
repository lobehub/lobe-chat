import dayjs from 'dayjs';

import { INBOX_SESSION_ID } from '@/const/session';
import { clientDB } from '@/database/client/db';
import { MessageItem } from '@/database/schemas';
import { MessageModel } from '@/database/server/models/message';
import { BaseClientService } from '@/services/baseClientService';
import {
  ChatMessage,
  ChatMessageError,
  ChatTTS,
  ChatTranslate,
  CreateMessageParams,
} from '@/types/message';

import { IMessageService } from './type';

export class ClientService extends BaseClientService implements IMessageService {
  private get messageModel(): MessageModel {
    return new MessageModel(clientDB as any, this.userId);
  }

  async createMessage({ sessionId, ...params }: CreateMessageParams) {
    const { id } = await this.messageModel.create({
      ...params,
      sessionId: this.toDbSessionId(sessionId) as string,
    });

    return id;
  }

  async batchCreateMessages(messages: MessageItem[]) {
    return this.messageModel.batchCreate(messages);
  }

  async getMessages(sessionId: string, topicId?: string) {
    const data = await this.messageModel.query({
      sessionId: this.toDbSessionId(sessionId),
      topicId,
    });

    return data as unknown as ChatMessage[];
  }

  async getAllMessages() {
    const data = await this.messageModel.queryAll();

    return data as unknown as ChatMessage[];
  }

  async countMessages() {
    return this.messageModel.count();
  }

  async countTodayMessages() {
    const topics = await this.messageModel.queryAll();
    return topics.filter(
      (item) => dayjs(item.createdAt).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD'),
    ).length;
  }

  async getAllMessagesInSession(sessionId: string) {
    const data = this.messageModel.queryBySessionId(this.toDbSessionId(sessionId));

    return data as unknown as ChatMessage[];
  }

  async updateMessageError(id: string, error: ChatMessageError) {
    return this.messageModel.update(id, { error });
  }

  async updateMessage(id: string, message: Partial<MessageItem>) {
    return this.messageModel.update(id, message);
  }

  async updateMessageTTS(id: string, tts: Partial<ChatTTS> | false) {
    return this.messageModel.updateTTS(id, tts as any);
  }

  async updateMessageTranslate(id: string, translate: Partial<ChatTranslate> | false) {
    return this.messageModel.updateTranslate(id, translate as any);
  }

  async updateMessagePluginState(id: string, value: Record<string, any>) {
    return this.messageModel.updatePluginState(id, value);
  }

  async updateMessagePluginArguments(id: string, value: string | Record<string, any>) {
    const args = typeof value === 'string' ? value : JSON.stringify(value);

    return this.messageModel.updateMessagePlugin(id, { arguments: args });
  }

  async removeMessage(id: string) {
    return this.messageModel.deleteMessage(id);
  }

  async removeMessages(ids: string[]) {
    return this.messageModel.deleteMessages(ids);
  }

  async removeMessagesByAssistant(sessionId: string, topicId?: string) {
    return this.messageModel.deleteMessagesBySession(this.toDbSessionId(sessionId), topicId);
  }

  async removeAllMessages() {
    return this.messageModel.deleteAllMessages();
  }

  async hasMessages() {
    const number = await this.countMessages();
    return number > 0;
  }

  private toDbSessionId(sessionId: string | undefined) {
    return sessionId === INBOX_SESSION_ID ? undefined : sessionId;
  }
}
