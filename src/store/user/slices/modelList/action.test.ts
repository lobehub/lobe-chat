import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { userService } from '@/services/user';
import { useUserStore } from '@/store/user';
import { GeneralModelProviderConfig } from '@/types/settings';

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

describe('LLMSettingsSliceAction', () => {
  describe('setModelProviderConfig', () => {
    it('should set OpenAI configuration', async () => {
      const { result } = renderHook(() => useUserStore());
      const openAIConfig: Partial<GeneralModelProviderConfig> = { apiKey: 'test-key' };

      // Perform the action
      await act(async () => {
        await result.current.setModelProviderConfig('openai', openAIConfig);
      });

      // Assert that updateUserSettings was called with the correct OpenAI configuration
      expect(userService.updateUserSettings).toHaveBeenCalledWith({
        languageModel: {
          openai: openAIConfig,
        },
      });
    });
  });

  describe('dispatchCustomModelCards', () => {
    it('should return early when prevState does not exist', async () => {
      const { result } = renderHook(() => useUserStore());
      const provider = 'openai';
      const payload: CustomModelCardDispatch = { type: 'add', modelCard: { id: 'test-id' } };

      // Mock the selector to return undefined
      vi.spyOn(settingsSelectors, 'providerConfig').mockReturnValue(() => undefined);
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
                  tokens: 128000,
                  enabled: true,
                },
                {
                  displayName: 'ChatGPT-4 Vision',
                  functionCall: true,
                  id: 'gpt-4-turbo-2024-04-09',
                  tokens: 128000,
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
          tokens: 128000,
        },
        {
          displayName: 'ChatGPT-4 Vision',
          enabled: true,
          functionCall: true,
          id: 'gpt-4-turbo-2024-04-09',
          tokens: 128000,
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
      expect(ollamaList?.chatModels.find((c) => c.id === 'llava')).toEqual({
        displayName: 'LLaVA 7B',
        enabled: true,
        id: 'llava',
        tokens: 4096,
        vision: true,
      });
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
});
