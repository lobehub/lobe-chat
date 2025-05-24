import {
  DEFAULT_AI_IMAGE_MODEL,
  DEFAULT_AI_IMAGE_PROVIDER,
  GenerationTopicState,
} from '@/store/aiImage/slices/generationTopic/initialState';

const currentGenerationTopic = (s: GenerationTopicState) => s.generationTopicMap[s.activeId];

const currentGenerationTopicModel = (s: GenerationTopicState) =>
  currentGenerationTopic(s).model || DEFAULT_AI_IMAGE_MODEL;

const currentGenerationTopicProvider = (s: GenerationTopicState) =>
  currentGenerationTopic(s).provider || DEFAULT_AI_IMAGE_PROVIDER;

export const generationTopicSelectors = {
  currentGenerationTopic,
  currentGenerationTopicModel,
  currentGenerationTopicProvider,
};
