import { CreateMessageParams, MessageModel } from '@/database/models/message';
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
    return MessageModel.batchCreate(messages as any);
  }

  async getMessages(sessionId: string, topicId?: string): Promise<ChatMessage[]> {
    console.time('getMessages');

    const messages = await MessageModel.query({ sessionId, topicId });

    console.timeEnd('getMessages');

    const finalList: ChatMessage[] = [];

    const addItem = (item: ChatMessage) => {
      const isExist = finalList.findIndex((i) => item.id === i.id) > -1;
      if (!isExist) {
        finalList.push(item);
      }
    };

    // 基于添加逻辑进行重排序
    for (const item of messages) {
      // 先判存在与否，不存在就加入
      addItem(item);

      for (const another of messages) {
        if (another.parentId === item.id) {
          addItem(another);
        }
      }
    }

    return finalList.map((f) => ({ ...f, meta: {} }));
  }

  async removeMessage(id: string) {
    return MessageModel.delete(id);
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
    console.time('bindMessagesToTopic');
    const data = await MessageModel.batchUpdate(messageIds, { topicId });

    console.timeEnd('bindMessagesToTopic');
    return data;
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
