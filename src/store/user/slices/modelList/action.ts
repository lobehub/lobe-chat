import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';
import { UserStore } from '@/store/user';
import { ChatModelCard } from '@/types/llm';
import { GlobalLLMConfig, GlobalLLMProviderKey } from '@/types/settings';

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
    config: Partial<GlobalLLMConfig[T]>,
  ) => Promise<void>;
  toggleEditingCustomModelCard: (params?: { id: string; provider: GlobalLLMProviderKey }) => void;

  toggleProviderEnabled: (provider: GlobalLLMProviderKey, enabled: boolean) => Promise<void>;

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

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const mergeModels = (provider: GlobalLLMProviderKey, defaultChatModels: ChatModelCard[]) => {
      // if the chat model is config in the server side, use the server side model cards
      const serverChatModels = modelProviderSelectors.serverProviderModelCards(provider)(get());
      const remoteChatModels = modelProviderSelectors.remoteProviderModelCards(provider)(get());

      return serverChatModels ?? remoteChatModels ?? defaultChatModels;
    };

    const defaultModelProviderList = produce(DEFAULT_MODEL_PROVIDER_LIST, (draft) => {
      const openai = draft.find((d) => d.id === ModelProvider.OpenAI);
      if (openai) openai.chatModels = mergeModels('openai', openai.chatModels);

      const azure = draft.find((d) => d.id === ModelProvider.Azure);
      if (azure) azure.chatModels = mergeModels('azure', azure.chatModels);

      const ollama = draft.find((d) => d.id === ModelProvider.Ollama);
      if (ollama) ollama.chatModels = mergeModels('ollama', ollama.chatModels);

      const openrouter = draft.find((d) => d.id === ModelProvider.OpenRouter);
      if (openrouter) openrouter.chatModels = mergeModels('openrouter', openrouter.chatModels);

      const togetherai = draft.find((d) => d.id === ModelProvider.TogetherAI);
      if (togetherai) togetherai.chatModels = mergeModels('togetherai', togetherai.chatModels);
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
