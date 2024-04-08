import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { userService } from '@/services/user';
import { useGlobalStore } from '@/store/global';
import { GeneralModelProviderConfig } from '@/types/settings';

// Mock userService
vi.mock('@/services/user', () => ({
  userService: {
    updateUserSettings: vi.fn(),
    resetUserSettings: vi.fn(),
  },
}));

describe('SettingsAction', () => {
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
});
