import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import {
  AnthropicProviderCard,
  AzureProviderCard,
  BedrockProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  TogetherAIProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
} from '@/config/modelProviders';
import { GlobalStore } from '@/store/global';
import { ChatModelCard } from '@/types/llm';
import { GlobalLLMConfig, GlobalLLMProviderKey } from '@/types/settings';
import { setNamespace } from '@/utils/storeDebug';

import { CustomModelCardDispatch, customModelCardsReducer } from '../reducers/customModelCard';
import { modelProviderSelectors } from '../selectors/modelProvider';
import { settingsSelectors } from '../selectors/settings';

const n = setNamespace('settings');

/**
 * 设置操作
 */
export interface LLMSettingsAction {
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

export const llmSettingsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  LLMSettingsAction
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

    const defaultModelProviderList = [
      {
        ...OpenAIProviderCard,
        chatModels: mergeModels('openai', OpenAIProviderCard.chatModels),
      },
      { ...AzureProviderCard, chatModels: mergeModels('azure', []) },
      { ...OllamaProviderCard, chatModels: mergeModels('ollama', OllamaProviderCard.chatModels) },
      AnthropicProviderCard,
      GoogleProviderCard,
      {
        ...OpenRouterProviderCard,
        chatModels: mergeModels('openrouter', OpenRouterProviderCard.chatModels),
      },
      {
        ...TogetherAIProviderCard,
        chatModels: mergeModels('togetherai', TogetherAIProviderCard.chatModels),
      },
      BedrockProviderCard,
      PerplexityProviderCard,
      MistralProviderCard,
      GroqProviderCard,
      MoonshotProviderCard,
      ZeroOneProviderCard,
      ZhiPuProviderCard,
    ];

    set({ defaultModelProviderList }, false, n(`refreshDefaultModelList - ${params?.trigger}`));

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

    set({ modelProviderList }, false, n(`refreshModelList - ${params?.trigger}`));
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
