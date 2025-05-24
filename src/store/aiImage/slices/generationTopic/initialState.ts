import { DeepPartial } from 'utility-types';

import { BLANK_GENERATION_TOPIC_ID } from '@/const/aiImage';
import { ModelProvider } from '@/libs/model-runtime/types/type';
import { AiImageGenerationTopic } from '@/types/aiImage';

export const DEFAULT_AI_IMAGE_PROVIDER = ModelProvider.Fal;
export const DEFAULT_AI_IMAGE_MODEL = 'flux/schnell';

const DEFAULT_GENERATION_TOPIC_ID: Partial<AiImageGenerationTopic> = {
  id: BLANK_GENERATION_TOPIC_ID,
  model: DEFAULT_AI_IMAGE_MODEL,
  provider: ModelProvider.Fal,
};

export interface GenerationTopicState {
  activeGenerationTopicId?: string;
  activeId: string;
  generationTopicInitMap: Record<string, boolean>;
  generationTopicMap: Record<string, DeepPartial<AiImageGenerationTopic>>;
  isBlankGenerationTopicInit: boolean;
}

export const initialGenerationTopicState: GenerationTopicState = {
  activeId: BLANK_GENERATION_TOPIC_ID,
  generationTopicInitMap: {},
  generationTopicMap: {
    [BLANK_GENERATION_TOPIC_ID]: DEFAULT_GENERATION_TOPIC_ID,
  },
  isBlankGenerationTopicInit: false,
};
