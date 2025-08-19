import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import { generateModelDisplayName } from '@/utils/modelDisplayName';
import { aiProviderService } from '@/services/aiProvider';
import type { AiInfraStore } from '../../store';
import {
  AiProviderDetailItem,
  AiProviderListItem,
  AiProviderRuntimeState,
  AiProviderSortMap,
  AiProviderSourceEnum,
  CreateAiProviderParams,
  EnabledProvider,
  UpdateAiProviderConfigParams,
  UpdateAiProviderParams,
} from '@/types/aiProvider';
import { LobeDefaultAiModelListItem, ModelAbilities } from '@/types/aiModel';

enum AiProviderSwrKey {
  fetchAiProviderItem = 'FETCH_AI_PROVIDER_ITEM',
  fetchAiProviderList = 'FETCH_AI_PROVIDER',
  fetchAiProviderRuntimeState = 'FETCH_AI_PROVIDER_RUNTIME_STATE',
}

type AiProviderRuntimeStateWithBuiltinModels = AiProviderRuntimeState & {
  builtinAiModelList: LobeDefaultAiModelListItem[];
};

export interface AiProviderAction {
  createNewAiProvider: (params: CreateAiProviderParams) => Promise<void>;
  deleteAiProvider: (id: string) => Promise<void>;
  internal_toggleAiProviderConfigUpdating: (id: string, loading: boolean) => void;
  internal_toggleAiProviderLoading: (id: string, loading: boolean) => void;
  refreshAiProviderDetail: () => Promise<void>;
  refreshAiProviderList: () => Promise<void>;
  refreshAiProviderRuntimeState: () => Promise<void>;
  removeAiProvider: (id: string) => Promise<void>;
  toggleProviderEnabled: (id: string, enabled: boolean) => Promise<void>;
  updateAiProvider: (id: string, value: UpdateAiProviderParams) => Promise<void>;
  updateAiProviderConfig: (id: string, value: UpdateAiProviderConfigParams) => Promise<void>;
  updateAiProviderSort: (items: AiProviderSortMap[]) => Promise<void>;

  useFetchAiProviderItem: (id: string) => SWRResponse<AiProviderDetailItem | undefined>;
  useFetchAiProviderList: (params?: { suspense?: boolean }) => SWRResponse<AiProviderListItem[]>;
  useFetchAiProviderRuntimeState: (
    isLoginOnInit: boolean | undefined,
  ) => SWRResponse<AiProviderRuntimeStateWithBuiltinModels | undefined>;
}

export const createAiProviderSlice: StateCreator<AiInfraStore, [], [], AiProviderAction> = (
  set,
  get,
) => ({
  createNewAiProvider: async (params) => {
    await aiProviderService.createAiProvider({ ...params, source: AiProviderSourceEnum.Custom });
    await get().refreshAiProviderList();
  },
  deleteAiProvider: async (id: string) => {
    await aiProviderService.deleteAiProvider(id);
    await get().refreshAiProviderList();
  },
  internal_toggleAiProviderConfigUpdating: (id, loading) => {
    set((state) => {
      if (loading)
        return { aiProviderConfigUpdatingIds: [...state.aiProviderConfigUpdatingIds, id] };

      return {
        aiProviderConfigUpdatingIds: state.aiProviderConfigUpdatingIds.filter((i) => i !== id),
      };
    }, false);
  },
  internal_toggleAiProviderLoading: (id, loading) => {
    set((state) => {
      if (loading) return { aiProviderLoadingIds: [...state.aiProviderLoadingIds, id] };

      return { aiProviderLoadingIds: state.aiProviderLoadingIds.filter((i) => i !== id) };
    }, false);
  },
  refreshAiProviderDetail: async () => {
    await mutate([AiProviderSwrKey.fetchAiProviderItem, get().activeAiProvider]);
    await get().refreshAiProviderRuntimeState();
  },
  refreshAiProviderList: async () => {
    await mutate(AiProviderSwrKey.fetchAiProviderList);
    await get().refreshAiProviderRuntimeState();
  },
  refreshAiProviderRuntimeState: async () => {
    await mutate([AiProviderSwrKey.fetchAiProviderRuntimeState, true]);
  },
  removeAiProvider: async (id) => {
    await aiProviderService.deleteAiProvider(id);
    await get().refreshAiProviderList();
  },

  toggleProviderEnabled: async (id: string, enabled: boolean) => {
    get().internal_toggleAiProviderLoading(id, true);
    await aiProviderService.toggleProviderEnabled(id, enabled);
    await get().refreshAiProviderList();
    get().internal_toggleAiProviderLoading(id, false);
  },

  updateAiProvider: async (id, value) => {
    get().internal_toggleAiProviderLoading(id, true);
    await aiProviderService.updateAiProvider(id, value);
    await get().refreshAiProviderList();
    await get().refreshAiProviderDetail();
    get().internal_toggleAiProviderLoading(id, false);
  },

  updateAiProviderConfig: async (id, value) => {
    get().internal_toggleAiProviderConfigUpdating(id, true);
    await aiProviderService.updateAiProviderConfig(id, value);
    await get().refreshAiProviderDetail();
    get().internal_toggleAiProviderConfigUpdating(id, false);
  },

  updateAiProviderSort: async (items) => {
    await aiProviderService.updateAiProviderOrder(items);
    await get().refreshAiProviderList();
  },

  useFetchAiProviderItem: (id) =>
    useSWR<AiProviderDetailItem | undefined>(
      [AiProviderSwrKey.fetchAiProviderItem, id],
      () => aiProviderService.getAiProviderById(id),
      {
        onSuccess: (data) => {
          if (!data) return;
          set({ activeAiProvider: id, aiProviderDetail: data }, false);
        },
      },
    ),

  useFetchAiProviderList: () =>
    useSWR<AiProviderListItem[]>(
      AiProviderSwrKey.fetchAiProviderList,
      () => aiProviderService.getAiProviderList(),
      {
        fallbackData: [],
        onSuccess: (data) => {
          if (!get().initAiProviderList) {
            set({ aiProviderList: data, initAiProviderList: true }, false);
            return;
          }
          set({ aiProviderList: data }, false);
        },
      },
    ),

  useFetchAiProviderRuntimeState: (isLogin) =>
    useSWR<AiProviderRuntimeStateWithBuiltinModels | undefined>(
      [AiProviderSwrKey.fetchAiProviderRuntimeState, isLogin],
      async ([, isLogin]) => {
        if (isLogin) {
          const runtimeState = await aiProviderService.getAiProviderRuntimeState();
          return {
            ...runtimeState,
            builtinAiModelList: LOBE_DEFAULT_MODEL_LIST,
          };
        }

        // 未登录状态：返回默认的模型和提供商配置
        const enabledAiProviders: EnabledProvider[] = DEFAULT_MODEL_PROVIDER_LIST.filter(
          (provider) => provider.enabled,
        ).map((item) => ({ id: item.id, name: item.name, source: 'builtin' }));

        const allModels = LOBE_DEFAULT_MODEL_LIST;

        return {
          builtinAiModelList: LOBE_DEFAULT_MODEL_LIST,
          enabledAiModels: allModels
            .filter((m) => m.enabled)
            .map((model) => ({
              abilities: model.abilities,
              contextWindowTokens: model.contextWindowTokens,
              displayName: model.displayName,
              enabled: model.enabled,
              id: model.id,
              providerId: model.providerId,
              sort: 0,
              type: model.type,
            })),
          enabledAiProviders: enabledAiProviders,
          enabledChatAiProviders: [],
          enabledImageAiProviders: [],
          runtimeConfig: {},
        };
      },
      {
        onSuccess: async (data) => {
          if (!data) return;

          // 完整的数据处理逻辑（包含去重和displayName处理）
          const getModelListByType = (providerId: string, type: string) => {
            const models = data.enabledAiModels.filter(
              (model) => model.providerId === providerId && model.type === type,
            );

            // 按模型ID去重，优先保留有displayName的版本
            const uniqueModels = new Map();

            models.forEach((model) => {
              const existingModel = uniqueModels.get(model.id);

              // 如果没有现有模型，或者当前模型有更好的displayName，则使用当前模型
              if (
                !existingModel ||
                (!existingModel.displayName && model.displayName) ||
                (model.displayName && model.displayName.length > 0)
              ) {
                // 生成友好的显示名称
                const displayName = generateModelDisplayName(model.id, model.displayName);

                uniqueModels.set(model.id, {
                  abilities: model.abilities as ModelAbilities,
                  contextWindowTokens: model.contextWindowTokens,
                  displayName,
                  id: model.id,
                });
              }
            });

            return Array.from(uniqueModels.values()).sort((a, b) =>
              a.displayName.localeCompare(b.displayName),
            );
          };

          // 基于 enabledAiProviders 构建分类的提供商列表
          const enabledChatProviders = data.enabledAiProviders.filter((provider) => {
            return data.enabledAiModels.some(
              (model) => model.providerId === provider.id && model.type === 'chat',
            );
          });

          const enabledImageProviders = data.enabledAiProviders.filter((provider) => {
            return data.enabledAiModels.some(
              (model) => model.providerId === provider.id && model.type === 'image',
            );
          });

          // 组装最终数据结构
          const enabledChatModelList = enabledChatProviders.map((provider) => ({
            ...provider,
            children: getModelListByType(provider.id, 'chat'),
            name: provider.name || provider.id,
          }));

          const enabledImageModelList = enabledImageProviders.map((provider) => ({
            ...provider,
            children: getModelListByType(provider.id, 'image'),
            name: provider.name || provider.id,
          }));

          set(
            {
              aiProviderRuntimeConfig: data.runtimeConfig,
              builtinAiModelList: LOBE_DEFAULT_MODEL_LIST,
              enabledAiModels: data.enabledAiModels,
              enabledAiProviders: data.enabledAiProviders,
              enabledChatModelList,
              enabledImageModelList,
            },
            false,
          );
        },
      },
    ),
});
