import dayjs from 'dayjs';

import { FileModel } from '@/database/_deprecated/models/file';
import { MessageModel } from '@/database/_deprecated/models/message';
import { DB_Message } from '@/database/_deprecated/schemas/message';
import {
  ChatFileItem,
  ChatMessage,
  ChatMessageError,
  ChatTTS,
  ChatTranslate,
  CreateMessageParams,
  MessageItem,
  MessageKeywordSearchResult,
  ModelRankItem,
} from '@/types/message';

import { IMessageService } from './type';

export class ClientService implements IMessageService {
  async createMessage(data: CreateMessageParams) {
    const { id } = await MessageModel.create(data);

    return id;
  }

  // @ts-ignore
  async batchCreateMessages(messages: ChatMessage[]) {
    return MessageModel.batchCreate(messages);
  }

  async getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]> {
    const messages = await MessageModel.query({ sessionId, topicId });

    const fileList = (await Promise.all(
      messages
        .flatMap((item) => item.files)
        .filter(Boolean)
        .map(async (id) => FileModel.findById(id!)),
    )) as ChatFileItem[];

    return messages.map((item) => ({
      ...item,
      imageList: fileList
        .filter((file) => item.files?.includes(file.id) && file.fileType.startsWith('image'))
        .map((file) => ({
          alt: file.name,
          id: file.id,
          url: file.url,
        })),
    }));
  }

  async getGroupMessages(groupId: string, topicId?: string): Promise<ChatMessage[]> {
    // For the deprecated service, group messages are the same as regular messages
    // since the old schema doesn't differentiate between session and group messages
    return this.getMessages(groupId, topicId);
  }

  async getAllMessages() {
    return MessageModel.queryAll();
  }

  async countMessages() {
    return MessageModel.count();
  }

  // @ts-ignore
  async rankModels(): Promise<ModelRankItem[]> {
    throw new Error('Method not implemented.');
  }

  // @ts-ignore
  async countWords(): Promise<number> {
    throw new Error('Method not implemented.');
  }

  // @ts-ignore
  async getHeatmaps() {
    throw new Error('Method not implemented.');
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

  async searchMessages(keyword: string, params?: { current?: number; pageSize?: number }) {
    const current = Math.max(params?.current ?? 0, 0);
    const pageSize = Math.max(params?.pageSize ?? 20, 1);
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return {
        data: [],
        pagination: { current, pageSize, total: 0 },
      } satisfies MessageKeywordSearchResult;
    }

    const messages = await MessageModel.queryAll();

    const matched = messages
      .filter((message) => (message.content || '').toLowerCase().includes(normalizedKeyword))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    const start = current * pageSize;
    const slice = matched.slice(start, start + pageSize);

    return {
      data: slice.map<MessageItem>((message) => ({
        agentId: (message as any).agentId ?? null,
        clientId: null,
        content: message.content ?? '',
        createdAt: new Date(message.createdAt || Date.now()),
        error: null,
        favorite: null,
        id: message.id,
        metadata: null,
        model: null,
        observationId: null,
        parentId: message.parentId ?? null,
        provider: null,
        quotaId: null,
        reasoning: null,
        role: message.role,
        search: null,
        sessionId: message.sessionId ?? null,
        threadId: message.threadId ?? null,
        tools: null,
        topicId: message.topicId ?? null,
        traceId: null,
        updatedAt: new Date(message.updatedAt || message.createdAt || Date.now()),
        userId: '',
      })),
      pagination: {
        current,
        pageSize,
        total: matched.length,
      },
    } satisfies MessageKeywordSearchResult;
  }

  async updateMessageError(id: string, error: ChatMessageError) {
    return MessageModel.update(id, { error });
  }

  // @ts-ignore
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

  async updateMessagePluginArguments(id: string, value: string | Record<string, any>) {
    const args = typeof value === 'string' ? value : JSON.stringify(value);

    return MessageModel.updatePlugin(id, { arguments: args });
  }

  async bindMessagesToTopic(topicId: string, messageIds: string[]) {
    return MessageModel.batchUpdate(messageIds, { topicId });
  }

  async removeMessage(id: string) {
    return MessageModel.delete(id);
  }

  async removeMessages(ids: string[]) {
    return MessageModel.bulkDelete(ids);
  }

  async removeMessagesByAssistant(assistantId: string, topicId?: string) {
    return MessageModel.batchDelete(assistantId, topicId);
  }

  async removeMessagesByGroup(groupId: string, topicId?: string) {
    return MessageModel.batchDelete(groupId, topicId);
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

  async updateMessagePluginError() {
    throw new Error('Method not implemented.');
  }

  async updateMessageRAG(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
