import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeSessions } from '@/types/session';

import { useToolStore } from '../../store';
import { PluginDispatch } from './reducers/manifest';

beforeEach(() => {
  // Reset all mocks before each test
  vi.resetAllMocks();
});

describe('useToolStore:plugin', () => {
  describe('checkLocalEnabledPlugins', () => {
    it('should call checkPluginsIsInstalled with unique plugins from sessions', async () => {
      // Mock sessions with some plugins
      const sessions = [
        { config: { plugins: ['plugin1', 'plugin2'] } },
        { config: { plugins: ['plugin2', 'plugin3'] } },
      ] as LobeSessions;

      // Mock implementation for useToolStore
      const checkPluginsIsInstalledMock = vi.fn();
      useToolStore.setState({ checkPluginsIsInstalled: checkPluginsIsInstalledMock });

      const { result } = renderHook(() => useToolStore());

      // Call the action with our mock sessions
      await act(async () => {
        await result.current.checkLocalEnabledPlugins(sessions);
      });

      // Verify that checkPluginsIsInstalled was called with the correct unique plugins
      expect(checkPluginsIsInstalledMock).toHaveBeenCalledWith(['plugin1', 'plugin2', 'plugin3']);
    });

    it('should not call checkPluginsIsInstalled if sessions have no plugins', async () => {
      // Mock sessions with no plugins
      const sessions = [
        { config: { plugins: [] } },
        { config: {} }, // config without plugins
      ] as LobeSessions;

      // Mock implementation for useToolStore
      const checkPluginsIsInstalledMock = vi.fn();
      useToolStore.setState({ checkPluginsIsInstalled: checkPluginsIsInstalledMock });

      const { result } = renderHook(() => useToolStore());

      // Call the action with our mock sessions
      await act(async () => {
        await result.current.checkLocalEnabledPlugins(sessions);
      });

      // Verify that checkPluginsIsInstalled was not called
      expect(checkPluginsIsInstalledMock).not.toHaveBeenCalled();
    });
  });

  describe('deletePluginSettings', () => {
    it('should delete the settings for a given plugin', () => {
      const pluginId = 'test-plugin';
      useToolStore.setState({
        pluginsSettings: {
          [pluginId]: { setting1: 'value1' },
        },
      });

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.deletePluginSettings(pluginId);
      });

      expect(useToolStore.getState().pluginsSettings[pluginId]).toBeUndefined();
    });
  });

  describe('dispatchPluginManifest', () => {
    it('should update the pluginManifestMap with the given payload', () => {
      const payload: PluginDispatch = {
        type: 'addManifest',
        id: 'plugin1',
        plugin: { identifier: 'plugin1' } as LobeChatPluginManifest,
      };
      useToolStore.setState({
        pluginManifestMap: {},
      });

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.dispatchPluginManifest(payload);
      });

      expect(useToolStore.getState().pluginManifestMap).toHaveProperty(payload.id);
      expect(useToolStore.getState().pluginManifestMap[payload.id]).toEqual(payload.plugin);
    });
  });

  describe('updatePluginSettings', () => {
    it('should update settings for a given plugin', () => {
      const pluginId = 'test-plugin';
      const newSettings = { setting1: 'new-value' };
      useToolStore.setState({
        pluginsSettings: {
          [pluginId]: { setting1: 'value1' },
        },
      });

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.updatePluginSettings(pluginId, newSettings);
      });

      expect(useToolStore.getState().pluginsSettings[pluginId]).toEqual(newSettings);
    });
  });

  describe('resetPluginSettings', () => {
    it('should reset all plugin settings', () => {
      useToolStore.setState({
        pluginsSettings: {
          plugin1: { setting1: 'value1' },
          plugin2: { setting2: 'value2' },
        },
      });

      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.resetPluginSettings();
      });

      expect(useToolStore.getState().pluginsSettings).toEqual({});
    });
  });
});
