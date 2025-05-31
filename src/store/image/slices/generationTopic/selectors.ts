import { GenerationTopicState } from '@/store/image/slices/generationTopic/initialState';

const generationTopics = (s: GenerationTopicState) => s.generationTopics;

export const generationTopicSelectors = {
  generationTopics,
};
