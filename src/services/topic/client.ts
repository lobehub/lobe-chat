import { INBOX_SESSION_ID } from '@/const/session';
import { clientDB } from '@/database/client/db';
import { TopicModel } from '@/database/server/models/topic';
import { BaseClientService } from '@/services/baseClientService';
import { ChatTopic } from '@/types/topic';

import { ITopicService } from './type';

export class ClientService extends BaseClientService implements ITopicService {
  private get topicModel(): TopicModel {
    return new TopicModel(clientDB as any, this.userId);
  }

  createTopic: ITopicService['createTopic'] = async (params) => {
    const item = await this.topicModel.create({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    } as any);

    if (!item) {
      throw new Error('topic create Error');
    }

    return item.id;
  };

  batchCreateTopics: ITopicService['batchCreateTopics'] = async (importTopics) => {
    const data = await this.topicModel.batchCreate(importTopics as any);

    return { added: data.length, ids: [], skips: [], success: true };
  };

  cloneTopic: ITopicService['cloneTopic'] = async (id, newTitle) => {
    const data = await this.topicModel.duplicate(id, newTitle);
    return data.topic.id;
  };

  getTopics: ITopicService['getTopics'] = async (params) => {
    const data = await this.topicModel.query({
      ...params,
      sessionId: this.toDbSessionId(params.sessionId),
    });
    return data as unknown as Promise<ChatTopic[]>;
  };

  searchTopics: ITopicService['searchTopics'] = async (keyword, sessionId) => {
    const data = await this.topicModel.queryByKeyword(keyword, this.toDbSessionId(sessionId));

    return data as unknown as Promise<ChatTopic[]>;
  };

  getAllTopics: ITopicService['getAllTopics'] = async () => {
    const data = await this.topicModel.queryAll();

    return data as unknown as Promise<ChatTopic[]>;
  };

  countTopics: ITopicService['countTopics'] = async (params) => {
    return this.topicModel.count(params);
  };

  rankTopics: ITopicService['rankTopics'] = async (limit) => {
    return this.topicModel.rank(limit);
  };

  updateTopic: ITopicService['updateTopic'] = async (id, data) => {
    return this.topicModel.update(id, data as any);
  };

  removeTopic: ITopicService['removeTopic'] = async (id) => {
    return this.topicModel.delete(id);
  };

  removeTopics: ITopicService['removeTopics'] = async (sessionId) => {
    return this.topicModel.batchDeleteBySessionId(this.toDbSessionId(sessionId));
  };

  batchRemoveTopics: ITopicService['batchRemoveTopics'] = async (topics) => {
    return this.topicModel.batchDelete(topics);
  };

  removeAllTopic: ITopicService['removeAllTopic'] = async () => {
    return this.topicModel.deleteAll();
  };

  private toDbSessionId(sessionId?: string | null) {
    return sessionId === INBOX_SESSION_ID ? null : sessionId;
  }
}
