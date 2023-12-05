import { act, renderHook } from '@testing-library/react';
import { notification } from 'antd';
import useSWR from 'swr';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { pluginService } from '@/services/plugin';
import { CustomPlugin } from '@/types/plugin';

import { useToolStore } from '../../store';

// Mock the pluginService.getPluginList method
vi.mock('@/services/plugin', () => ({
  pluginService: {
    fetchManifest: vi.fn(),
    getPluginList: vi.fn(),
  },
}));

// Mock necessary modules and functions
vi.mock('antd', () => ({
  notification: {
    error: vi.fn(),
  },
}));

// Mock useSWR
vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}));

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('useToolStore:pluginStore', () => {
  describe('loadPluginStore', () => {
    it('should load plugin list and update state', async () => {
      // Given
      const pluginListMock = { plugins: [{ identifier: 'plugin1' }, { identifier: 'plugin2' }] };
      (pluginService.getPluginList as Mock).mockResolvedValue(pluginListMock);

      // When
      let pluginList;
      await act(async () => {
        pluginList = await useToolStore.getState().loadPluginStore();
      });

      // Then
      expect(pluginService.getPluginList).toHaveBeenCalled();
      expect(pluginList).toEqual(pluginListMock);
      expect(useToolStore.getState().pluginList).toEqual(pluginListMock.plugins);
    });

    it('should handle errors when loading plugin list', async () => {
      // Given
      const error = new Error('Failed to load plugin list');
      (pluginService.getPluginList as Mock).mockRejectedValue(error);

      // When
      let pluginList;
      let errorOccurred = false;
      try {
        await act(async () => {
          pluginList = await useToolStore.getState().loadPluginStore();
        });
      } catch (e) {
        errorOccurred = true;
      }

      // Then
      expect(pluginService.getPluginList).toHaveBeenCalled();
      expect(errorOccurred).toBe(true);
      expect(pluginList).toBeUndefined();
      // Ensure the state is not updated with an undefined value
      expect(useToolStore.getState().pluginList).not.toBeUndefined();
    });
  });

  describe('useFetchPluginStore', () => {
    it('should use SWR to fetch plugin store', async () => {
      // Given
      const pluginListMock = { plugins: [{ identifier: 'plugin1' }, { identifier: 'plugin2' }] };
      (useSWR as Mock).mockReturnValue({
        data: pluginListMock,
        error: null,
        isValidating: false,
      });

      // When
      const { result } = renderHook(() => useToolStore.getState().useFetchPluginStore());

      // Then
      expect(useSWR).toHaveBeenCalledWith('loadPluginStore', expect.any(Function));
      expect(result.current.data).toEqual(pluginListMock);
      expect(result.current.error).toBeNull();
      expect(result.current.isValidating).toBe(false);
    });

    it('should handle errors when fetching plugin store with SWR', async () => {
      // Given
      const error = new Error('Failed to fetch plugin store');
      (useSWR as Mock).mockReturnValue({
        data: null,
        error: error,
        isValidating: false,
      });

      // When
      const { result } = renderHook(() => useToolStore.getState().useFetchPluginStore());

      // Then
      expect(useSWR).toHaveBeenCalledWith('loadPluginStore', expect.any(Function));
      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(result.current.isValidating).toBe(false);
    });
  });

  describe.skip('installPlugin', () => {
    it('should install a plugin with valid manifest', async () => {
      const updateInstallLoadingStateMock = vi.fn();

      act(() => {
        useToolStore.setState({
          customPluginList: [
            {
              identifier: 'plugin1',
              meta: { title: 'plugin1', avatar: '🍏' },
              manifest: 'https://abc.com/manifest.json',
            } as CustomPlugin,
          ],
          updateInstallLoadingState: updateInstallLoadingStateMock,
        });
      });

      const pluginManifestMock = {
        $schema: '../node_modules/@lobehub/chat-plugin-sdk/schema.json',
        api: [
          {
            url: 'https://realtime-weather.chat-plugin.lobehub.com/api/v1',
            name: 'fetchCurrentWeather',
            description: '获取当前天气情况',
            parameters: {
              properties: {
                city: {
                  description: '城市名称',
                  type: 'string',
                },
              },
              required: ['city'],
              type: 'object',
            },
          },
        ],
        author: 'LobeHub',
        createAt: '2023-08-12',
        homepage: 'https://github.com/lobehub/chat-plugin-realtime-weather',
        identifier: 'realtime-weather',
        meta: {
          avatar: '🌈',
          tags: ['weather', 'realtime'],
          title: 'Realtime Weather',
          description: 'Get realtime weather information',
        },
        ui: {
          url: 'https://realtime-weather.chat-plugin.lobehub.com/iframe',
          height: 310,
        },
        version: '1',
      };
      (pluginService.fetchManifest as Mock).mockResolvedValue(pluginManifestMock);

      await act(async () => {
        await useToolStore.getState().installPlugin('plugin1');
      });

      // Then
      expect(pluginService.fetchManifest).toHaveBeenCalled();
      expect(notification.error).not.toHaveBeenCalled();
      expect(updateInstallLoadingStateMock).toHaveBeenCalledTimes(2);
    });

    it.skip('should throw error with no manifest url', async () => {
      // Given

      const pluginManifestMock = { identifier: 'plugin1', version: '1.0.0' };
      (pluginService.fetchManifest as Mock).mockResolvedValue(pluginManifestMock);

      useToolStore.setState({
        customPluginList: [
          {
            identifier: 'plugin1',
            meta: { title: 'plugin1', avatar: '🍏' },
          } as CustomPlugin,
        ],
      });
      // const fn = async () => {
      //   useToolStore.getState().installPlugin('plugin1');
      // };

      // Then
      // expect(fn).toThrowError('noManifest');
      // expect(notification.error).toHaveBeenCalledWith({
      //   description: 'error.noManifest',
      //   message: 'error.installError',
      // });
    });

    it.skip('should throw error with invalid manifest', async () => {
      act(() => {
        useToolStore.setState({
          customPluginList: [
            {
              identifier: 'plugin1',
              meta: { title: 'plugin1', avatar: '🍏' },
              manifest: 'https://abc.com/manifest.json',
            } as CustomPlugin,
          ],
        });
      });

      const pluginManifestMock = { identifier: 'plugin1', version: '1.0.0' };
      (pluginService.fetchManifest as Mock).mockResolvedValue(pluginManifestMock);

      await act(async () => {
        await useToolStore.getState().installPlugin('plugin1');
      });

      // Then
      expect(pluginService.fetchManifest).toHaveBeenCalled();
      expect(notification.error).not.toHaveBeenCalled();

      // expect(useToolStore.getState().updateInstallLoadingState).toHaveBeenCalledTimes(2);
    });

    it.skip('should handle error when manifest is not available', async () => {
      // Given
      const pluginIdentifier = 'plugin2';

      // When
      await act(async () => {
        await useToolStore.getState().installPlugin(pluginIdentifier);
      });

      // Then
      expect(notification.error).toHaveBeenCalledWith({
        description: 'error.noManifest',
        message: 'error.installError',
      });
    });

    // ... Add more test cases for error handling (fetchError and manifestInvalid)
  });

  describe.skip('installPlugins', () => {
    it('should install multiple plugins', async () => {
      // Given
      act(() => {
        useToolStore.setState({
          customPluginList: [
            {
              identifier: 'plugin1',
              meta: { title: 'plugin1', avatar: '🍏' },
              manifest: 'https://abc.com/manifest.json',
            } as CustomPlugin,
            {
              identifier: 'plugin2',
              meta: { title: 'plugin2', avatar: '🍏' },
              manifest: 'https://abc.com/manifest.json',
            } as CustomPlugin,
          ],
        });
      });

      const plugins = ['plugin1', 'plugin2'];
      const pluginManifestMock = {
        $schema: '../node_modules/@lobehub/chat-plugin-sdk/schema.json',
        api: [
          {
            url: 'https://realtime-weather.chat-plugin.lobehub.com/api/v1',
            name: 'fetchCurrentWeather',
            description: '获取当前天气情况',
            parameters: {
              properties: {
                city: {
                  description: '城市名称',
                  type: 'string',
                },
              },
              required: ['city'],
              type: 'object',
            },
          },
        ],
        author: 'LobeHub',
        createAt: '2023-08-12',
        homepage: 'https://github.com/lobehub/chat-plugin-realtime-weather',
        identifier: 'realtime-weather',
        meta: {
          avatar: '🌈',
          tags: ['weather', 'realtime'],
          title: 'Realtime Weather',
          description: 'Get realtime weather information',
        },
        ui: {
          url: 'https://realtime-weather.chat-plugin.lobehub.com/iframe',
          height: 310,
        },
        version: '1',
      };

      (pluginService.fetchManifest as Mock).mockResolvedValue(pluginManifestMock);

      // When
      await act(async () => {
        await useToolStore.getState().installPlugins(plugins);
      });

      // Then
      expect(Object.keys(useToolStore.getState().pluginManifestMap)).toHaveLength(2);
    });
  });
});
