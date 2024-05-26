import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { ModelProviderCard } from '@/types/llm';
import { ServerLanguageModel } from '@/types/serverConfig';

export interface ModelListState {
  defaultModelProviderList: ModelProviderCard[];
  editingCustomCardModel?: { id: string; provider: string } | undefined;
  modelProviderList: ModelProviderCard[];
  serverLanguageModel?: ServerLanguageModel;
}

export const initialModelListState: ModelListState = {
  defaultModelProviderList: DEFAULT_MODEL_PROVIDER_LIST,
  modelProviderList: DEFAULT_MODEL_PROVIDER_LIST,
};
