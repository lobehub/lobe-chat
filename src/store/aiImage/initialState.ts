import {
  GenerationConfigState,
  initialGenerationConfigState,
} from './slices/generationConfig/initialState';
import {
  GenerationTopicState,
  initialGenerationTopicState,
} from './slices/generationTopic/initialState';

export type AiImageStoreState = GenerationConfigState & GenerationTopicState;

export const initialState: AiImageStoreState = {
  ...initialGenerationConfigState,
  ...initialGenerationTopicState,
};
