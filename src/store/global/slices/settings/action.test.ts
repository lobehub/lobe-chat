import { act, renderHook, waitFor } from '@testing-library/react';
import { DeepPartial } from 'utility-types';
import { describe, expect, it, vi } from 'vitest';
import { withSWR } from '~test-utils';

import { DEFAULT_AGENT, DEFAULT_SETTINGS } from '@/const/settings';
import { userService } from '@/services/user';
import { useGlobalStore } from '@/store/global';
import { SettingsTabs } from '@/store/global/initialState';
import { LobeAgentSettings } from '@/types/session';
import { GlobalSettings, OpenAIConfig } from '@/types/settings';

// Mock userService
vi.mock('@/services/user', () => ({
  userService: {
    updateUserSettings: vi.fn(),
    resetUserSettings: vi.fn(),
  },
}));

describe('SettingsAction', () => {
  describe('importAppSettings', () => {
    it('should import app settings', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const newSettings: GlobalSettings = {
        ...DEFAULT_SETTINGS,
        themeMode: 'dark',
      };

      // Mock the internal setSettings function call
      const setSettingsSpy = vi.spyOn(result.current, 'setSettings');

      // Perform the action
      await act(async () => {
        await result.current.importAppSettings(newSettings);
      });

      // Assert that setSettings was called with the correct settings
      expect(setSettingsSpy).toHaveBeenCalledWith({
        ...DEFAULT_SETTINGS,
        password: undefined,
        themeMode: 'dark',
      });

      // Assert that the state has been updated
      expect(userService.updateUserSettings).toHaveBeenCalledWith({ themeMode: 'dark' });

      // Restore the spy
      setSettingsSpy.mockRestore();
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to default', async () => {
      const { result } = renderHook(() => useGlobalStore());

      // Perform the action
      await act(async () => {
        await result.current.resetSettings();
      });

      // Assert that resetUserSettings was called
      expect(userService.resetUserSettings).toHaveBeenCalled();

      // Assert that the state has been updated to default settings
      expect(result.current.settings).toEqual({});
    });
  });

  describe('setModelProviderConfig', () => {
    it('should set OpenAI configuration', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const openAIConfig: Partial<OpenAIConfig> = { OPENAI_API_KEY: 'test-key' };

      // Perform the action
      await act(async () => {
        await result.current.setModelProviderConfig('openAI', openAIConfig);
      });

      // Assert that updateUserSettings was called with the correct OpenAI configuration
      expect(userService.updateUserSettings).toHaveBeenCalledWith({
        languageModel: {
          openAI: openAIConfig,
        },
      });
    });
  });
  describe('setSettings', () => {
    it('should set partial settings', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const partialSettings: Partial<GlobalSettings> = { themeMode: 'dark' };

      // Perform the action
      await act(async () => {
        await result.current.setSettings(partialSettings);
      });

      // Assert that updateUserSettings was called with the correct settings
      expect(userService.updateUserSettings).toHaveBeenCalledWith(partialSettings);
    });
  });

  describe('switchSettingTabs', () => {
    it('should switch settings tabs', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        result.current.switchSettingTabs(SettingsTabs.Agent);
      });

      expect(result.current.settingsTab).toEqual(SettingsTabs.Agent);
    });
  });

  describe('switchThemeMode', () => {
    it('should switch theme mode', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const themeMode = 'light';

      // Perform the action
      await act(async () => {
        await result.current.switchThemeMode(themeMode);
      });

      // Assert that updateUserSettings was called with the correct theme mode
      expect(userService.updateUserSettings).toHaveBeenCalledWith({ themeMode });
    });
  });

  describe('updateDefaultAgent', () => {
    it('should update default agent settings', async () => {
      const { result } = renderHook(() => useGlobalStore());
      const updatedAgent: Partial<LobeAgentSettings> = {
        meta: { title: 'docs' },
      };

      // Perform the action
      await act(async () => {
        await result.current.updateDefaultAgent(updatedAgent);
      });

      // Assert that updateUserSettings was called with the merged agent settings
      expect(userService.updateUserSettings).toHaveBeenCalledWith({ defaultAgent: updatedAgent });
    });
  });
});
