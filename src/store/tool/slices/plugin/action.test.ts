import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { pluginService } from '@/services/plugin';

import { useToolStore } from '../../store';

vi.mock('@/services/plugin', () => ({
  pluginService: {
    updatePluginSettings: vi.fn(),
    removeAllPlugins: vi.fn(),
  },
}));

beforeEach(() => {
  // Reset all mocks before each test
  vi.resetAllMocks();
});

describe('useToolStore:plugin', () => {
  describe('updatePluginSettings', () => {
    it('should update settings for a given plugin', async () => {
      const pluginId = 'test-plugin';
      const newSettings = { setting1: 'new-value' };

      const { result } = renderHook(() => useToolStore());

      await act(async () => {
        await result.current.updatePluginSettings(pluginId, newSettings);
      });

      expect(pluginService.updatePluginSettings).toBeCalledWith(pluginId, newSettings);
    });
  });

  describe('removeAllPlugins', () => {
    it('should reset all plugin settings', () => {
      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.removeAllPlugins();
      });

      expect(pluginService.removeAllPlugins).toBeCalled();
    });
  });
});
