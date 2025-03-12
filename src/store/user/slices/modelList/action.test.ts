import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { modelsService } from '@/services/models';
import { userService } from '@/services/user';
import { useUserStore } from '@/store/user';
import { ProviderConfig } from '@/types/user/settings';

import { settingsSelectors } from '../settings/selectors';
import { CustomModelCardDispatch } from './reducers/customModelCard';
import { modelProviderSelectors } from './selectors';

// Mock userService
vi.mock('@/services/user', () => ({
  userService: {
    updateUserSettings: vi.fn(),
    resetUserSettings: vi.fn(),
  },
}));

vi.mock('zustand/traditional');

describe('LLMSettingsSliceAction', () => {
  describe('setModelProviderConfig', () => {
    it('should set OpenAI configuration', async () => {
      const { result } = renderHook(() => useUserStore());
      const openAIConfig: Partial<ProviderConfig> = { fetchOnClient: true };

      // Perform the action
      await act(async () => {
        await result.current.setModelProviderConfig('openai', openAIConfig);
      });

      // Assert that updateUserSettings was called with the correct OpenAI configuration
      expect(userService.updateUserSettings).toHaveBeenCalledWith(
        { languageModel: { openai: openAIConfig } },
        expect.any(AbortSignal),
      );
    });
  });

  describe('dispatchCustomModelCards', () => {
    it('should return early when prevState does not exist', async () => {
      const { result } = renderHook(() => useUserStore());
      const provider = 'openai';
      const payload: CustomModelCardDispatch = { type: 'add', modelCard: { id: 'test-id' } };

      // Mock the selector to return undefined
      vi.spyOn(settingsSelectors, 'providerConfig').mockReturnValueOnce(() => undefined);
      vi.spyOn(result.current, 'setModelProviderConfig');

      await act(async () => {
        await result.current.dispatchCustomModelCards(provider, payload);
      });

      // Assert that setModelProviderConfig was not called
      expect(result.current.setModelProviderConfig).not.toHaveBeenCalled();
    });
  });

  describe('refreshDefaultModelProviderList', () => {
    it('default', async () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        useUserStore.setState({
          serverLanguageModel: {
            azure: { serverModelCards: [{ id: 'abc', deploymentName: 'abc' }] },
          },
        });
      });

      act(() => {
        result.current.refreshDefaultModelProviderList();
      });

      // Assert that setModelProviderConfig was not called
      const azure = result.current.defaultModelProviderList.find((m) => m.id === 'azure');
      expect(azure?.chatModels).toEqual([{ id: 'abc', deploymentName: 'abc' }]);
    });

    it('openai', () => {
      const { result } = renderHook(() => useUserStore());
      act(() => {
        useUserStore.setState({
          serverLanguageModel: {
            openai: {
              enabled: true,
              enabledModels: ['gpt-4-0125-preview', 'gpt-4-turbo-2024-04-09'],
              serverModelCards: [
                {
                  displayName: 'ChatGPT-4',
                  functionCall: true,
                  id: 'gpt-4-0125-preview',
                  contextWindowTokens: 128000,
                  enabled: true,
                },
                {
                  displayName: 'ChatGPT-4 Vision',
                  functionCall: true,
                  id: 'gpt-4-turbo-2024-04-09',
                  contextWindowTokens: 128000,
                  vision: true,
                  enabled: true,
                },
              ],
            },
          },
        });
      });

      act(() => {
        result.current.refreshDefaultModelProviderList();
      });

      // Assert that setModelProviderConfig was not called
      const openai = result.current.defaultModelProviderList.find((m) => m.id === 'openai');
      expect(openai?.chatModels).toEqual([
        {
          displayName: 'ChatGPT-4',
          enabled: true,
          functionCall: true,
          id: 'gpt-4-0125-preview',
          contextWindowTokens: 128000,
        },
        {
          displayName: 'ChatGPT-4 Vision',
          enabled: true,
          functionCall: true,
          id: 'gpt-4-turbo-2024-04-09',
          contextWindowTokens: 128000,
          vision: true,
        },
      ]);
    });
  });

  describe('refreshModelProviderList', () => {
    it('visible', async () => {
      const { result } = renderHook(() => useUserStore());
      act(() => {
        useUserStore.setState({
          settings: {
            languageModel: {
              ollama: { enabledModels: ['llava'] },
            },
          },
        });
      });

      act(() => {
        result.current.refreshModelProviderList();
      });

      const ollamaList = result.current.modelProviderList.find((r) => r.id === 'ollama');
      // Assert that setModelProviderConfig was not called
      const model = ollamaList?.chatModels.find((c) => c.id === 'llava');

      expect(model).toMatchSnapshot();
    });

    it('modelProviderListForModelSelect should return only enabled providers', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        useUserStore.setState({
          settings: {
            languageModel: {
              perplexity: { enabled: true },
              azure: { enabled: false },
            },
          },
        });
      });

      act(() => {
        result.current.refreshModelProviderList();
      });

      const enabledProviders = modelProviderSelectors.modelProviderListForModelSelect(
        result.current,
      );
      expect(enabledProviders).toHaveLength(3);
      expect(enabledProviders.at(-1)!.id).toBe('perplexity');
    });
  });

  describe('removeEnabledModels', () => {
    it('should remove the specified model from enabledModels', async () => {
      const { result } = renderHook(() => useUserStore());
      const model = 'gpt-3.5-turbo';

      const spyOn = vi.spyOn(userService, 'updateUserSettings');

      act(() => {
        useUserStore.setState({
          settings: {
            languageModel: {
              azure: { enabledModels: ['gpt-3.5-turbo', 'gpt-4'] },
            },
          },
        });
      });

      await act(async () => {
        console.log(JSON.stringify(result.current.settings));
        await result.current.removeEnabledModels('azure', model);
      });

      expect(spyOn).toHaveBeenCalledWith(
        { languageModel: { azure: { enabledModels: ['gpt-4'] } } },
        expect.any(AbortSignal),
      );
    });
  });

  describe('toggleEditingCustomModelCard', () => {
    it('should update editingCustomCardModel when params are provided', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.toggleEditingCustomModelCard({ id: 'test-id', provider: 'openai' });
      });

      expect(result.current.editingCustomCardModel).toEqual({ id: 'test-id', provider: 'openai' });
    });

    it('should reset editingCustomCardModel when no params are provided', () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.toggleEditingCustomModelCard();
      });

      expect(result.current.editingCustomCardModel).toBeUndefined();
    });
  });

  describe('toggleProviderEnabled', () => {
    it('should enable the provider', async () => {
      const { result } = renderHook(() => useUserStore());

      await act(async () => {
        await result.current.toggleProviderEnabled('minimax', true);
      });

      expect(userService.updateUserSettings).toHaveBeenCalledWith(
        { languageModel: { minimax: { enabled: true } } },
        expect.any(AbortSignal),
      );
    });

    it('should disable the provider', async () => {
      const { result } = renderHook(() => useUserStore());
      const provider = 'openai';

      await act(async () => {
        await result.current.toggleProviderEnabled(provider, false);
      });

      expect(userService.updateUserSettings).toHaveBeenCalledWith(
        { languageModel: { openai: { enabled: false } } },
        expect.any(AbortSignal),
      );
    });
  });

  describe('updateEnabledModels', () => {
    // TODO: 有待 updateEnabledModels 实现的同步改造
    it('should add new custom model to customModelCards', async () => {
      const { result } = renderHook(() => useUserStore());
      const provider = 'openai';
      const modelKeys = ['gpt-3.5-turbo', 'custom-model'];
      const options = [{ value: 'gpt-3.5-turbo' }, {}];

      await act(async () => {
        await result.current.updateEnabledModels(provider, modelKeys, options);
      });

      expect(userService.updateUserSettings).toHaveBeenCalledWith(
        {
          languageModel: {
            openai: {
              customModelCards: [{ id: 'custom-model' }],
              // TODO：目标单测中需要包含下面这一行
              // enabledModels: ['gpt-3.5-turbo', 'custom-model'],
            },
          },
        },
        expect.any(AbortSignal),
      );
    });

    it('should not add removed model to customModelCards', async () => {
      const { result } = renderHook(() => useUserStore());
      const provider = 'openai';
      const modelKeys = ['gpt-3.5-turbo'];
      const options = [{ value: 'gpt-3.5-turbo' }];

      act(() => {
        useUserStore.setState({
          settings: {
            languageModel: {
              openai: { enabledModels: ['gpt-3.5-turbo', 'gpt-4'] },
            },
          },
        });
      });

      await act(async () => {
        await result.current.updateEnabledModels(provider, modelKeys, options);
      });

      expect(userService.updateUserSettings).toHaveBeenCalledWith(
        {
          languageModel: { openai: { enabledModels: ['gpt-3.5-turbo'] } },
        },
        expect.any(AbortSignal),
      );
    });
  });

  describe('useFetchProviderModelList', () => {
    it('should fetch data when enabledAutoFetch is true', async () => {
      const { result } = renderHook(() => useUserStore());
      const provider = 'openai';
      const enabledAutoFetch = true;

      const spyOn = vi.spyOn(result.current, 'refreshDefaultModelProviderList');

      vi.spyOn(modelsService, 'getChatModels').mockResolvedValueOnce([]);

      renderHook(() => result.current.useFetchProviderModelList(provider, enabledAutoFetch));

      await waitFor(() => {
        expect(spyOn).toHaveBeenCalled();
      });

      // expect(result.current.settings.languageModel.openai?.latestFetchTime).toBeDefined();
      // expect(result.current.settings.languageModel.openai?.remoteModelCards).toBeDefined();
    });

    it('should not fetch data when enabledAutoFetch is false', async () => {
      const { result } = renderHook(() => useUserStore());
      const provider = 'openai';
      const enabledAutoFetch = false;

      const spyOn = vi.spyOn(result.current, 'refreshDefaultModelProviderList');

      vi.spyOn(modelsService, 'getChatModels').mockResolvedValueOnce([]);

      renderHook(() => result.current.useFetchProviderModelList(provider, enabledAutoFetch));

      await waitFor(() => {
        expect(spyOn).not.toHaveBeenCalled();
      });
    });
  });
});
