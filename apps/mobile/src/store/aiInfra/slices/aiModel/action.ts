import isEqual from 'fast-deep-equal';
import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { aiModelService } from '@/services/aiModel';
import type { AiInfraStore } from '../../store';
import {
  AiModelSortMap,
  AiProviderModelListItem,
  CreateAiModelParams,
  ToggleAiModelEnableParams,
} from '@/types/aiModel';

const FETCH_AI_PROVIDER_MODEL_LIST_KEY = 'FETCH_AI_PROVIDER_MODELS';

export interface AiModelAction {
  batchToggleAiModels: (ids: string[], enabled: boolean) => Promise<void>;
  batchUpdateAiModels: (models: AiProviderModelListItem[]) => Promise<void>;
  clearModelsByProvider: (provider: string) => Promise<void>;
  clearRemoteModels: (provider: string) => Promise<void>;
  createNewAiModel: (params: CreateAiModelParams) => Promise<void>;
  fetchRemoteModelList: (providerId: string) => Promise<void>;
  internal_toggleAiModelLoading: (id: string, loading: boolean) => void;

  refreshAiModelList: () => Promise<void>;
  removeAiModel: (id: string, providerId: string) => Promise<void>;
  toggleModelEnabled: (params: Omit<ToggleAiModelEnableParams, 'providerId'>) => Promise<void>;
  updateAiModelsConfig: (
    id: string,
    providerId: string,
    data: Partial<AiProviderModelListItem>,
  ) => Promise<void>;
  updateAiModelsSort: (providerId: string, items: AiModelSortMap[]) => Promise<void>;

  useFetchAiProviderModels: (id: string) => SWRResponse<AiProviderModelListItem[]>;
}

export const createAiModelSlice: StateCreator<AiInfraStore, [], [], AiModelAction> = (
  set,
  get,
) => ({
  batchToggleAiModels: async (ids, enabled) => {
    const { activeAiProvider } = get();
    if (!activeAiProvider) return;

    await aiModelService.batchToggleAiModels(activeAiProvider, ids, enabled);
    await get().refreshAiModelList();
  },

  batchUpdateAiModels: async (models) => {
    const { activeAiProvider } = get();
    if (!activeAiProvider) return;

    await aiModelService.batchUpdateAiModels(activeAiProvider, models);
    await get().refreshAiModelList();
  },

  clearModelsByProvider: async (provider) => {
    await aiModelService.clearModelsByProvider(provider);
    await get().refreshAiModelList();
  },

  clearRemoteModels: async (provider) => {
    await aiModelService.clearRemoteModels(provider);
    await get().refreshAiModelList();
  },

  createNewAiModel: async (params) => {
    await aiModelService.createAiModel(params);
    await get().refreshAiModelList();
  },

  fetchRemoteModelList: async () => {
    // 注意：这个方法在原始 service 中没有直接对应，可能需要通过其他方式实现
    // 暂时通过刷新模型列表来更新远程模型
    await get().refreshAiModelList();
  },

  internal_toggleAiModelLoading: (id, loading) => {
    set((state) => {
      if (loading) return { aiModelLoadingIds: [...state.aiModelLoadingIds, id] };

      return { aiModelLoadingIds: state.aiModelLoadingIds.filter((i) => i !== id) };
    }, false);
  },

  refreshAiModelList: async () => {
    await mutate([FETCH_AI_PROVIDER_MODEL_LIST_KEY, get().activeAiProvider]);
    // make refresh provide runtime state async, not block
    get().refreshAiProviderRuntimeState();
  },

  removeAiModel: async (id, providerId) => {
    await aiModelService.deleteAiModel({ id, providerId });
    await get().refreshAiModelList();
  },

  toggleModelEnabled: async (params) => {
    const { activeAiProvider } = get();
    if (!activeAiProvider) return;

    get().internal_toggleAiModelLoading(params.id, true);

    await aiModelService.toggleModelEnabled({ ...params, providerId: activeAiProvider });
    await get().refreshAiModelList();

    get().internal_toggleAiModelLoading(params.id, false);
  },

  updateAiModelsConfig: async (id, providerId, data) => {
    await aiModelService.updateAiModel(id, providerId, data);
    await get().refreshAiModelList();
  },

  updateAiModelsSort: async (id, items) => {
    await aiModelService.updateAiModelOrder(id, items);
    await get().refreshAiModelList();
  },

  useFetchAiProviderModels: (id) =>
    useSWR<AiProviderModelListItem[]>(
      [FETCH_AI_PROVIDER_MODEL_LIST_KEY, id],
      async ([, id]) => {
        return aiModelService.getAiProviderModelList(id as string);
      },
      {
        onSuccess: (data) => {
          // no need to update list if the list have been init and data is the same
          if (get().isAiModelListInit && isEqual(data, get().aiProviderModelList)) return;

          set({ aiProviderModelList: data, isAiModelListInit: true }, false);
        },
      },
    ),
});
