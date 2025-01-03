import { EnabledProviderWithModels } from '@/types/aiModel';
import {
  AiProviderDetailItem,
  AiProviderListItem,
  AiProviderRuntimeConfig,
  EnabledAiModel,
  EnabledProvider,
} from '@/types/aiProvider';

export interface AIProviderState {
  activeAiProvider?: string;
  activeProviderModelList: any[];
  aiProviderDetail?: AiProviderDetailItem | null;
  aiProviderList: AiProviderListItem[];
  aiProviderLoadingIds: string[];
  aiProviderRuntimeConfig: Record<string, AiProviderRuntimeConfig>;
  enabledAiModels?: EnabledAiModel[];
  enabledAiProviders?: EnabledProvider[];
  // used for select
  enabledChatModelList?: EnabledProviderWithModels[];
  initAiProviderList: boolean;
  providerSearchKeyword: string;
}

export const initialAIProviderState: AIProviderState = {
  activeProviderModelList: [],
  aiProviderList: [],
  aiProviderLoadingIds: [],
  aiProviderRuntimeConfig: {},
  initAiProviderList: false,
  providerSearchKeyword: '',
};
