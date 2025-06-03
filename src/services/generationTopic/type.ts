import { UpdateTopicValue } from '@/server/routers/lambda/generationTopic';
import { ImageGenerationTopic } from '@/types/generation';

export interface IGenerationTopicService {
  getAllGenerationTopics(): Promise<ImageGenerationTopic[]>;
  createTopic(): Promise<string>;
  updateTopic(id: string, data: UpdateTopicValue): Promise<ImageGenerationTopic>;
  deleteTopic(id: string): Promise<ImageGenerationTopic>;
}
