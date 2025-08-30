/* eslint-disable typescript-sort-keys/interface */
import {
  AiModelSortMap,
  AiProviderModelListItem,
  CreateAiModelParams,
  ToggleAiModelEnableParams,
  UpdateAiModelParams,
} from 'model-bank';

export interface IAiModelService {
  createAiModel: (params: CreateAiModelParams) => Promise<any>;

  getAiProviderModelList: (id: string) => Promise<AiProviderModelListItem[]>;

  getAiModelById: (id: string) => Promise<any>;

  toggleModelEnabled: (params: ToggleAiModelEnableParams) => Promise<any>;

  updateAiModel: (id: string, providerId: string, value: UpdateAiModelParams) => Promise<any>;

  batchUpdateAiModels: (id: string, models: AiProviderModelListItem[]) => Promise<any>;

  batchToggleAiModels: (id: string, models: string[], enabled: boolean) => Promise<any>;

  clearRemoteModels: (providerId: string) => Promise<any>;

  clearModelsByProvider: (providerId: string) => Promise<any>;

  updateAiModelOrder: (providerId: string, items: AiModelSortMap[]) => Promise<any>;

  deleteAiModel: (params: { id: string; providerId: string }) => Promise<any>;
}
