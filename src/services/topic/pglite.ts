import { INBOX_SESSION_ID } from '@/const/session';
import { clientDB } from '@/database/client/db';
import { TopicModel } from '@/database/server/models/topic';
import { BaseClientService } from '@/services/baseClientService';
import { ChatTopic } from '@/types/topic';

import { CreateTopicParams, ITopicService, QueryTopicParams } from './type';

export class ClientService extends BaseClientService implements ITopicService {
  private get topicModel(): TopicModel {
    return new TopicModel(clientDB as any, this.userId);
  }

  async createTopic(params: CreateTopicParams): Promise<string> {
    const item = await this.topicModel.create({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    } as any);

    if (!item) {
      throw new Error('topic create Error');
    }

    return item.id;
  }

  async batchCreateTopics(importTopics: ChatTopic[]) {
    const data = await this.topicModel.batchCreate(importTopics as any);

    return { added: data.length, ids: [], skips: [], success: true };
  }

  async cloneTopic(id: string, newTitle?: string) {
    const data = await this.topicModel.duplicate(id, newTitle);
    return data.topic.id;
  }

  async getTopics(params: QueryTopicParams) {
    const data = await this.topicModel.query({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    });
    return data as unknown as Promise<ChatTopic[]>;
  }

  async searchTopics(keyword: string, sessionId?: string) {
    const data = await this.topicModel.queryByKeyword(keyword, this.toDbSessionId(sessionId));

    return data as unknown as Promise<ChatTopic[]>;
  }

  async getAllTopics() {
    const data = await this.topicModel.queryAll();

    return data as unknown as Promise<ChatTopic[]>;
  }

  async countTopics() {
    return this.topicModel.count();
  }

  async updateTopic(id: string, data: Partial<ChatTopic>) {
    return this.topicModel.update(id, data as any);
  }

  async removeTopic(id: string) {
    return this.topicModel.delete(id);
  }

  async removeTopics(sessionId: string) {
    return this.topicModel.batchDeleteBySessionId(this.toDbSessionId(sessionId));
  }

  async batchRemoveTopics(topics: string[]) {
    return this.topicModel.batchDelete(topics);
  }

  async removeAllTopic() {
    return this.topicModel.deleteAll();
  }

  private toDbSessionId(sessionId?: string | null) {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  }
}
