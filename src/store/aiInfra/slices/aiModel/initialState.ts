import { AiProviderModelListItem } from '@/types/aiModel';

export interface AIModelsState {
  aiModelLoadingIds: string[];
  aiProviderModelList: AiProviderModelListItem[];
  isAiModelListInit?: boolean;
  modelSearchKeyword: string;
}

export const initialAIModelState: AIModelsState = {
  aiModelLoadingIds: [],
  aiProviderModelList: [],
  modelSearchKeyword: '',
};
