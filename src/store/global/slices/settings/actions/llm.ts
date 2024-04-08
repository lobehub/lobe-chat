import type { StateCreator } from 'zustand/vanilla';

import { GlobalStore } from '@/store/global';
import { GlobalLLMConfig, GlobalLLMProviderKey } from '@/types/settings';

import { CustomModelCardDispatch, customModelCardsReducer } from '../reducers/customModelCard';
import { modelConfigSelectors } from '../selectors/modelConfig';

/**
 * 设置操作
 */
export interface LLMSettingsAction {
  dispatchCustomModelCards: (
    provider: GlobalLLMProviderKey,
    payload: CustomModelCardDispatch,
  ) => Promise<void>;
  removeEnabledModels: (provider: GlobalLLMProviderKey, model: string) => Promise<void>;
  setModelProviderConfig: <T extends GlobalLLMProviderKey>(
    provider: T,
    config: Partial<GlobalLLMConfig[T]>,
  ) => Promise<void>;
  toggleEditingCustomModelCard: (params?: { id: string; provider: GlobalLLMProviderKey }) => void;
  toggleProviderEnabled: (provider: GlobalLLMProviderKey, enabled: boolean) => Promise<void>;
}

export const llmSettingsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  LLMSettingsAction
> = (set, get) => ({
  dispatchCustomModelCards: async (provider, payload) => {
    const prevState = modelConfigSelectors.providerConfig(provider)(get());

    if (!prevState) return;

    const nextState = customModelCardsReducer(prevState.customModelCards, payload);

    await get().setModelProviderConfig(provider, { customModelCards: nextState });
  },
  removeEnabledModels: async (provider, model) => {
    const config = modelConfigSelectors.providerConfig(provider)(get());

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
});
