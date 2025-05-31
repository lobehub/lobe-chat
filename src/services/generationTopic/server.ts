import { lambdaClient } from '@/libs/trpc/client';
import { IGenerationTopicService } from '@/services/generationTopic/type';

export class ServerService implements IGenerationTopicService {
  getAllGenerationTopics: IGenerationTopicService['getAllGenerationTopics'] = async () => {
    return lambdaClient.generationTopic.getAllGenerationTopics.query();
  };

  createTopic: IGenerationTopicService['createTopic'] = () => {
    return lambdaClient.generationTopic.createTopic.mutate();
  };
}
