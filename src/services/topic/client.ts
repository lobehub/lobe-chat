import { TopicModel } from '@/database/client/models/topic';
import { ChatTopic } from '@/types/topic';

import { CreateTopicParams, ITopicService, QueryTopicParams } from './type';

export class ClientService implements ITopicService {
  async createTopic(params: CreateTopicParams): Promise<string> {
    const item = await TopicModel.create(params as any);

    if (!item) {
      throw new Error('topic create Error');
    }

    return item.id;
  }

  async batchCreateTopics(importTopics: ChatTopic[]) {
    return TopicModel.batchCreate(importTopics as any);
  }

  async cloneTopic(id: string, newTitle?: string) {
    return TopicModel.duplicateTopic(id, newTitle);
  }

  async getTopics(params: QueryTopicParams): Promise<ChatTopic[]> {
    return TopicModel.query(params);
  }

  async searchTopics(keyword: string, sessionId?: string) {
    return TopicModel.queryByKeyword(keyword, sessionId);
  }

  async getAllTopics() {
    return TopicModel.queryAll();
  }

  async updateTopicFavorite(id: string, favorite?: boolean) {
    return this.updateTopic(id, { favorite });
  }

  async updateTopicTitle(id: string, text: string) {
    return this.updateTopic(id, { title: text });
  }

  async updateTopic(id: string, data: Partial<ChatTopic>) {
    const favorite = typeof data.favorite !== 'undefined' ? (data.favorite ? 1 : 0) : undefined;

    return TopicModel.update(id, { ...data, favorite });
  }

  async removeTopic(id: string) {
    return TopicModel.delete(id);
  }

  async removeTopics(sessionId: string) {
    return TopicModel.batchDeleteBySessionId(sessionId);
  }

  async batchRemoveTopics(topics: string[]) {
    return TopicModel.batchDelete(topics);
  }

  async removeAllTopic() {
    return TopicModel.clearTable();
  }
}
