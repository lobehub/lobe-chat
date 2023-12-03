import { CreateMessageParams, MessageModel } from '@/database/models/message';
import { DB_Message } from '@/database/schemas/message';
import {
  ChatMessage,
  ChatMessageError,
  ChatPluginPayload,
  ChatTTS,
  ChatTranslate,
} from '@/types/chatMessage';
import { LLMRoleType } from '@/types/llm';

export class MessageService {
  async create(data: CreateMessageParams) {
    const { id } = await MessageModel.create(data);

    return id;
  }

  async batchCreate(messages: ChatMessage[]) {
    return MessageModel.batchCreate(messages);
  }

  async hasMessages() {
    const isEmpty = await MessageModel.isEmpty();
    return !isEmpty;
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

  async updateMessageContent(id: string, content: string) {
    return MessageModel.update(id, { content });
  }

  async updateMessageError(id: string, error: ChatMessageError) {
    return MessageModel.update(id, { error });
  }

  async updateMessageTranslate(id: string, data: Partial<ChatTranslate> | null) {
    return MessageModel.update(id, { translate: data as ChatTranslate });
  }

  async updateMessageTTS(id: string, data: Partial<ChatTTS> | null) {
    return MessageModel.update(id, { tts: data as ChatTTS });
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

  async updateMessageRole(id: string, role: LLMRoleType) {
    return MessageModel.update(id, { role });
  }

  async updateMessagePlugin(id: string, plugin: ChatPluginPayload) {
    return MessageModel.update(id, { plugin });
  }
  async updateMessagePluginState(id: string, key: string, value: any) {
    return MessageModel.update(id, { pluginState: { [key]: value } });
  }

  async getAllMessages() {
    return MessageModel.queryAll();
  }
}

export const messageService = new MessageService();
