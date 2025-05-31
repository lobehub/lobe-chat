import {
  GenerationConfigState,
  initialGenerationConfigState,
} from './slices/generationConfig/initialState';
import {
  GenerationTopicState,
  initialGenerationTopicState,
} from './slices/generationTopic/initialState';

export type ImageStoreState = GenerationConfigState & GenerationTopicState;

export const initialState: ImageStoreState = {
  ...initialGenerationConfigState,
  ...initialGenerationTopicState,
};
