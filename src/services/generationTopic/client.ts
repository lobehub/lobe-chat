import { clientDB } from '@/database/client/db';
import { GenerationTopicModel } from '@/database/models/generationTopic';
import { BaseClientService } from '@/services/baseClientService';

import { IGenerationTopicService } from './type';

export class ClientService extends BaseClientService implements IGenerationTopicService {
  private get topicModel(): GenerationTopicModel {
    return new GenerationTopicModel(clientDB as any, this.userId);
  }

  /**
   * TODO: 滚动无限加载
   */
  getAllGenerationTopics: IGenerationTopicService['getAllGenerationTopics'] = async () => {
    return this.topicModel.queryAll();
  };

  createTopic: IGenerationTopicService['createTopic'] = async () => {
    const item = await this.topicModel.create('');

    if (!item) {
      throw new Error('topic create Error');
    }

    return item.id;
  };

  updateTopic: IGenerationTopicService['updateTopic'] = async (id, data) => {
    // data 已经被 IGenerationTopicService 接口约束为 UpdateTopicValue
    return this.topicModel.update(id, data);
  };

  deleteTopic: IGenerationTopicService['deleteTopic'] = async (id) => {
    return this.topicModel.delete(id);
  };
}
