import { AIModelsState, initialAIModelState } from './slices/aiModel/initialState';
import { AIProviderState, initialAIProviderState } from './slices/aiProvider/initialState';

export interface AIProviderStoreState extends AIProviderState, AIModelsState {
  /* empty */
}

export const initialState: AIProviderStoreState = {
  ...initialAIProviderState,
  ...initialAIModelState,
};
