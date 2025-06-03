import { lambdaClient } from '@/libs/trpc/client';
import { IGenerationTopicService } from '@/services/generationTopic/type';

export class ServerService implements IGenerationTopicService {
  getAllGenerationTopics: IGenerationTopicService['getAllGenerationTopics'] = async () => {
    return lambdaClient.generationTopic.getAllGenerationTopics.query();
  };

  createTopic: IGenerationTopicService['createTopic'] = async () => {
    return lambdaClient.generationTopic.createTopic.mutate(undefined);
  };

  updateTopic: IGenerationTopicService['updateTopic'] = async (id, data) => {
    // data 已经被 IGenerationTopicService 接口约束为 UpdateTopicValue
    return lambdaClient.generationTopic.updateTopic.mutate({ id, value: data });
  };

  deleteTopic: IGenerationTopicService['deleteTopic'] = async (id) => {
    return lambdaClient.generationTopic.deleteTopic.mutate({ id });
  };
}
