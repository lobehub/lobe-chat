import { ImageGenerationTopic } from '@/types/generation';

export interface GenerationTopicState {
  activeGenerationTopicId: string | null;
  generationTopics: ImageGenerationTopic[];
}

export const initialGenerationTopicState: GenerationTopicState = {
  activeGenerationTopicId: null,
  generationTopics: [],
};
