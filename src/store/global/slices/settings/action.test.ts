import { act, renderHook } from '@testing-library/react';
import { DeepPartial } from 'utility-types';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_AGENT, DEFAULT_SETTINGS } from '@/const/settings';
import { useGlobalStore } from '@/store/global';
import { SettingsTabs } from '@/store/global/initialState';
import { LobeAgentSettings } from '@/types/session';
import { GlobalSettings, OpenAIConfig } from '@/types/settings';

beforeEach(() => {
  vi.clearAllMocks();
});

vi.mock('@/utils/uuid', () => ({
  nanoid: vi.fn(() => 'unique-id'),
}));

describe('SettingsAction', () => {
  describe('importAppSettings', () => {
    it('should import app settings', () => {
      const { result } = renderHook(() => useGlobalStore());
      const newSettings: GlobalSettings = {
        ...DEFAULT_SETTINGS,
        themeMode: 'dark',
      };

      act(() => {
        result.current.importAppSettings(newSettings);
      });

      expect(result.current.settings).toEqual(newSettings);
    });
  });

  describe('resetSettings', () => {
    it('should reset settings to default', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('setOpenAIConfig', () => {
    it('should set OpenAI configuration', () => {
      const { result } = renderHook(() => useGlobalStore());
      const openAIConfig: Partial<OpenAIConfig> = { OPENAI_API_KEY: 'test' };

      act(() => {
        result.current.setOpenAIConfig(openAIConfig);
      });

      expect(result.current.settings.languageModel.openAI.OPENAI_API_KEY).toEqual(
        openAIConfig.OPENAI_API_KEY,
      );
    });
  });

  describe('setSettings', () => {
    it('should set partial settings', () => {
      const { result } = renderHook(() => useGlobalStore());
      const partialSettings: Partial<GlobalSettings> = { themeMode: 'dark' };

      act(() => {
        result.current.setSettings(partialSettings);
      });

      expect(result.current.settings.themeMode).toEqual('dark');
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
    it('should switch theme mode', () => {
      const { result } = renderHook(() => useGlobalStore());

      act(() => {
        result.current.switchThemeMode('light');
      });

      expect(result.current.settings.themeMode).toEqual('light');
    });
  });

  describe('updateDefaultAgent', () => {
    it('should update default agent settings', () => {
      const { result } = renderHook(() => useGlobalStore());
      const updatedAgent: DeepPartial<LobeAgentSettings> = {
        meta: { title: 'docs' },
      };

      act(() => {
        result.current.updateDefaultAgent(updatedAgent);
      });

      expect(result.current.settings.defaultAgent).toEqual({
        ...DEFAULT_AGENT,
        ...updatedAgent,
      });
    });
  });
});
