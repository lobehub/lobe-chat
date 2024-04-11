import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { userService } from '@/services/user';
import { useGlobalStore } from '@/store/global';
import { modelConfigSelectors } from '@/store/global/slices/settings/selectors';
import { GeneralModelProviderConfig } from '@/types/settings';

import { CustomModelCardDispatch, customModelCardsReducer } from '../reducers/customModelCard';

// Mock userService
vi.mock('@/services/user', () => ({
  userService: {
    updateUserSettings: vi.fn(),
    resetUserSettings: vi.fn(),
  },
}));
vi.mock('../reducers/customModelCard', () => ({
  customModelCardsReducer: vi.fn().mockReturnValue([]),
}));

describe('LLMSettingsSliceAction', () => {
  describe('setModelProviderConfig', () => {
    it('should set OpenAI configuration', async () => {
      const { result } = renderHook(() => useGlobalStore());
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
      const { result } = renderHook(() => useGlobalStore());
      const provider = 'openai';
      const payload: CustomModelCardDispatch = { type: 'add', modelCard: { id: 'test-id' } };

      // Mock the selector to return undefined
      vi.spyOn(modelConfigSelectors, 'getConfigByProviderId').mockReturnValue(() => undefined);
      vi.spyOn(result.current, 'setModelProviderConfig');

      await act(async () => {
        await result.current.dispatchCustomModelCards(provider, payload);
      });

      // Assert that setModelProviderConfig was not called
      expect(result.current.setModelProviderConfig).not.toHaveBeenCalled();
    });
  });
});
