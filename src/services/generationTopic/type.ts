import { ImageGenerationTopic } from '@/types/generation';

export interface IGenerationTopicService {
  getAllGenerationTopics(): Promise<ImageGenerationTopic[]>;
  createTopic(): Promise<string>;
}
