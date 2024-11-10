import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';
import { UserStore } from '@/store/user';
import type { ChatModelCard, ModelProviderCard } from '@/types/llm';
import type {
  GlobalLLMProviderKey,
  UserKeyVaults,
  UserModelProviderConfig,
} from '@/types/user/settings';

import { settingsSelectors } from '../settings/selectors';
import { CustomModelCardDispatch, customModelCardsReducer } from './reducers/customModelCard';
import { modelProviderSelectors } from './selectors/modelProvider';

/**
 * 设置操作
 */
export interface ModelListAction {
  dispatchCustomModelCards: (
    provider: GlobalLLMProviderKey,
    payload: CustomModelCardDispatch,
  ) => Promise<void>;
  /**
   * make sure the default model provider list is sync to latest state
   */
  refreshDefaultModelProviderList: (params?: { trigger?: string }) => void;
  refreshModelProviderList: (params?: { trigger?: string }) => void;
  removeEnabledModels: (provider: GlobalLLMProviderKey, model: string) => Promise<void>;
  setModelProviderConfig: <T extends GlobalLLMProviderKey>(
    provider: T,
    config: Partial<UserModelProviderConfig[T]>,
  ) => Promise<void>;
  toggleEditingCustomModelCard: (params?: { id: string; provider: GlobalLLMProviderKey }) => void;

  toggleProviderEnabled: (provider: GlobalLLMProviderKey, enabled: boolean) => Promise<void>;

  updateEnabledModels: (
    provider: GlobalLLMProviderKey,
    modelKeys: string[],
    options: { label?: string; value?: string }[],
  ) => Promise<void>;

  updateKeyVaultConfig: <T extends GlobalLLMProviderKey>(
    provider: T,
    config: Partial<UserKeyVaults[T]>,
  ) => Promise<void>;

  useFetchProviderModelList: (
    provider: GlobalLLMProviderKey,
    enabledAutoFetch: boolean,
  ) => SWRResponse;
}

export const createModelListSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  ModelListAction
> = (set, get) => ({
  dispatchCustomModelCards: async (provider, payload) => {
    const prevState = settingsSelectors.providerConfig(provider)(get());

    if (!prevState) return;

    const nextState = customModelCardsReducer(prevState.customModelCards, payload);

    await get().setModelProviderConfig(provider, { customModelCards: nextState });
  },
  refreshDefaultModelProviderList: (params) => {
    /**
     * Because we have several model cards sources, we need to merge the model cards
     * the priority is below:
     * 1 - server side model cards
     * 2 - remote model cards
     * 3 - default model cards
     */

    const mergeModels = (providerKey: GlobalLLMProviderKey, providerCard: ModelProviderCard) => {
      // if the chat model is config in the server side, use the server side model cards
      const serverChatModels = modelProviderSelectors.serverProviderModelCards(providerKey)(get());
      const remoteChatModels = providerCard.modelList?.showModelFetcher
        ? modelProviderSelectors.remoteProviderModelCards(providerKey)(get())
        : undefined;

      return serverChatModels ?? remoteChatModels ?? providerCard.chatModels;
    };

    const defaultModelProviderList = produce(DEFAULT_MODEL_PROVIDER_LIST, (draft) => {
      Object.values(ModelProvider).forEach((id) => {
        const provider = draft.find((d) => d.id === id);
        if (provider) provider.chatModels = mergeModels(id as any, provider);
      });
    });

    set({ defaultModelProviderList }, false, `refreshDefaultModelList - ${params?.trigger}`);

    get().refreshModelProviderList({ trigger: 'refreshDefaultModelList' });
  },
  refreshModelProviderList: (params) => {
    const modelProviderList = get().defaultModelProviderList.map((list) => ({
      ...list,
      chatModels: modelProviderSelectors
        .getModelCardsById(list.id)(get())
        ?.map((model) => {
          const models = modelProviderSelectors.getEnableModelsById(list.id)(get());

          if (!models) return model;

          return {
            ...model,
            enabled: models?.some((m) => m === model.id),
          };
        }),
      enabled: modelProviderSelectors.isProviderEnabled(list.id as any)(get()),
    }));

    set({ modelProviderList }, false, `refreshModelList - ${params?.trigger}`);
  },

  removeEnabledModels: async (provider, model) => {
    const config = settingsSelectors.providerConfig(provider)(get());

    await get().setModelProviderConfig(provider, {
      enabledModels: config?.enabledModels?.filter((s) => s !== model).filter(Boolean),
    });
  },

  setModelProviderConfig: async (provider, config) => {
    await get().setSettings({ languageModel: { [provider]: config } });
  },

  toggleEditingCustomModelCard: (params) => {
    set({ editingCustomCardModel: params }, false, 'toggleEditingCustomModelCard');
  },

  toggleProviderEnabled: async (provider, enabled) => {
    await get().setSettings({ languageModel: { [provider]: { enabled } } });
  },
  updateEnabledModels: async (provider, value, options) => {
    const { dispatchCustomModelCards, setModelProviderConfig } = get();
    const enabledModels = modelProviderSelectors.getEnableModelsById(provider)(get());

    // if there is a new model, add it to `customModelCards`
    const pools = options.map(async (option: { label?: string; value?: string }, index: number) => {
      // if is a known model, it should have value
      // if is an unknown model, the option will be {}
      if (option.value) return;

      const modelId = value[index];

      // if is in enabledModels, it means it's a removed model
      if (enabledModels?.some((m) => modelId === m)) return;

      await dispatchCustomModelCards(provider, {
        modelCard: { id: modelId },
        type: 'add',
      });
    });

    // TODO: 当前的这个 pool 方法并不是最好的实现，因为它会触发 setModelProviderConfig 的多次更新。
    // 理论上应该合并这些变更，然后最后只做一次触发
    // 因此后续的做法应该是将 dispatchCustomModelCards 改造为同步方法，并在最后做一次异步更新
    // 对应需要改造 'should add new custom model to customModelCards' 这一个单测
    await Promise.all(pools);

    await setModelProviderConfig(provider, { enabledModels: value.filter(Boolean) });
  },

  updateKeyVaultConfig: async (provider, config) => {
    await get().setSettings({ keyVaults: { [provider]: config } });
  },

  useFetchProviderModelList: (provider, enabledAutoFetch) =>
    useSWR<ChatModelCard[] | undefined>(
      [provider, enabledAutoFetch],
      async ([p]) => {
        const { modelsService } = await import('@/services/models');

        return modelsService.getChatModels(p);
      },
      {
        onSuccess: async (data) => {
          if (data) {
            await get().setModelProviderConfig(provider, {
              latestFetchTime: Date.now(),
              remoteModelCards: data,
            });

            get().refreshDefaultModelProviderList();
          }
        },
        revalidateOnFocus: false,
        revalidateOnMount: enabledAutoFetch,
      },
    ),
});
