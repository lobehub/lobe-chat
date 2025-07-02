import { lambdaClient } from '@/libs/trpc/client';
import { UpdateTopicValue } from '@/server/routers/lambda/generationTopic';
import { ImageGenerationTopic } from '@/types/generation';

export class ServerService {
  async getAllGenerationTopics(): Promise<ImageGenerationTopic[]> {
    return lambdaClient.generationTopic.getAllGenerationTopics.query();
  }

  async createTopic(): Promise<string> {
    return lambdaClient.generationTopic.createTopic.mutate(undefined);
  }

  async updateTopic(id: string, data: UpdateTopicValue): Promise<ImageGenerationTopic> {
    return lambdaClient.generationTopic.updateTopic.mutate({ id, value: data });
  }

  async updateTopicCover(id: string, coverUrl: string): Promise<ImageGenerationTopic> {
    return lambdaClient.generationTopic.updateTopicCover.mutate({ id, coverUrl });
  }

  async deleteTopic(id: string): Promise<ImageGenerationTopic> {
    return lambdaClient.generationTopic.deleteTopic.mutate({ id });
  }
}

export const generationTopicService = new ServerService();
