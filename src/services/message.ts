import { CreateMessageParams, MessageModel } from '@/database/models/message';
import { DB_Message } from '@/database/schemas/message';
import { ChatMessageError, ChatTTS, ChatTranslate } from '@/types/chatMessage';
import { DBModel } from '@/types/database/db';

export class MessageService {
  async create(data: CreateMessageParams) {
    const { id } = await MessageModel.create(data);

    return id;
  }

  async getMessages(sessionId: string, topicId: string | undefined) {
    console.time('getMessages');

    console.log('topicId:', topicId);
    const messages: DBModel<DB_Message>[] = await MessageModel.query({ sessionId });

    console.timeEnd('getMessages');

    const finalList: DBModel<DB_Message>[] = [];

    const addItem = (item: DBModel<DB_Message>) => {
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

    return finalList;
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
}

export const messageService = new MessageService();
