import { LobeChatPluginManifest, LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { act, renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notification } from '@/components/AntdStaticMethods';
import { pluginService } from '@/services/plugin';

import { useToolStore } from '../../store';

// Mock necessary modules and functions
vi.mock('@/components/AntdStaticMethods', () => ({
  notification: {
    error: vi.fn(),
  },
}));
// Mock the pluginService.getPluginList method
vi.mock('@/services/plugin', () => ({
  pluginService: {
    getPluginManifest: vi.fn(),
    getPluginList: vi.fn(),
    uninstallPlugin: vi.fn(),
    installPlugin: vi.fn(),
  },
}));

// Mock i18next
vi.mock('i18next', () => ({
  t: vi.fn((key) => key),
}));

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
// Mock useSWR
vi.mock('swr', async () => {
  const actual = await vi.importActual('swr');
  return {
    ...(actual as any),
    default: vi.fn(),
  };
});

const logError = console.error;
beforeEach(() => {
  vi.restoreAllMocks();
  useToolStore.setState({
    pluginStoreList: [
      {
        identifier: 'plugin1',
        meta: { title: 'plugin1', avatar: '🍏' },
        manifest: 'https://abc.com/manifest.json',
        schemaVersion: 1,
      } as LobeChatPluginMeta,
    ],
  });
  console.error = () => {};
});
afterEach(() => {
  console.error = logError;
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
      expect(useToolStore.getState().pluginStoreList).toEqual(pluginListMock.plugins);
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
      expect(useToolStore.getState().pluginStoreList).not.toBeUndefined();
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

  describe('installPlugin', () => {
    it('should install a plugin with valid manifest', async () => {
      const pluginIdentifier = 'plugin1';

      const originalUpdateInstallLoadingState = useToolStore.getState().updateInstallLoadingState;
      const updateInstallLoadingStateMock = vi.fn();

      act(() => {
        useToolStore.setState({
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
      (pluginService.getPluginManifest as Mock).mockResolvedValue(pluginManifestMock);

      await act(async () => {
        await useToolStore.getState().installPlugin(pluginIdentifier);
      });

      // Then
      expect(pluginService.getPluginManifest).toHaveBeenCalled();
      expect(notification.error).not.toHaveBeenCalled();
      expect(updateInstallLoadingStateMock).toHaveBeenCalledTimes(2);
      expect(pluginService.installPlugin).toHaveBeenCalledWith({
        identifier: 'plugin1',
        type: 'plugin',
        manifest: pluginManifestMock,
      });

      act(() => {
        useToolStore.setState({
          updateInstallLoadingState: originalUpdateInstallLoadingState,
        });
      });
    });

    it('should throw error with no error', async () => {
      // Given

      const error = new TypeError('noManifest');

      // Mock necessary modules and functions
      (pluginService.getPluginManifest as Mock).mockRejectedValue(error);

      useToolStore.setState({
        pluginStoreList: [
          {
            identifier: 'plugin1',
            meta: { title: 'plugin1', avatar: '🍏' },
          } as LobeChatPluginMeta,
        ],
      });

      await act(async () => {
        await useToolStore.getState().installPlugin('plugin1');
      });

      expect(notification.error).toHaveBeenCalledWith({
        description: 'error.noManifest',
        message: 'error.installError',
      });
    });
  });

  describe('installPlugins', () => {
    it('should install multiple plugins', async () => {
      // Given
      act(() => {
        useToolStore.setState({
          pluginStoreList: [
            {
              identifier: 'plugin1',
              meta: { title: 'plugin1', avatar: '🍏' },
              manifest: 'https://abc.com/manifest.json',
            } as LobeChatPluginMeta,
            {
              identifier: 'plugin2',
              meta: { title: 'plugin2', avatar: '🍏' },
              manifest: 'https://abc.com/manifest.json',
            } as LobeChatPluginMeta,
          ],
        });
      });

      const plugins = ['plugin1', 'plugin2'];

      (pluginService.getPluginManifest as Mock).mockResolvedValue(pluginManifestMock);

      // When
      await act(async () => {
        await useToolStore.getState().installPlugins(plugins);
      });

      expect(pluginService.installPlugin).toHaveBeenCalledTimes(2);
    });
  });

  describe('unInstallPlugin', () => {
    it('should uninstall a plugin and remove its manifest', async () => {
      // Given
      const pluginIdentifier = 'plugin1';
      act(() => {
        useToolStore.setState({
          installedPlugins: [
            {
              identifier: pluginIdentifier,
              type: 'plugin',
              manifest: {
                identifier: pluginIdentifier,
                meta: {},
              } as LobeChatPluginManifest,
            },
          ],
        });
      });

      // When
      act(() => {
        useToolStore.getState().uninstallPlugin(pluginIdentifier);
      });

      // Then
      expect(pluginService.uninstallPlugin).toBeCalledWith(pluginIdentifier);
    });
  });

  describe('updateInstallLoadingState', () => {
    it('should update the loading state for a plugin', () => {
      const pluginIdentifier = 'abc';
      const loadingState = true;
      const { result } = renderHook(() => useToolStore());

      act(() => {
        result.current.updateInstallLoadingState(pluginIdentifier, loadingState);
      });

      expect(result.current.pluginInstallLoading[pluginIdentifier]).toBe(loadingState);
    });

    it('should clear the loading state for a plugin', () => {
      // Given
      const pluginIdentifier = 'dddd';
      const loadingState = undefined;

      act(() => {
        useToolStore.setState({ pluginInstallLoading: { [pluginIdentifier]: true } });
      });
      const { result } = renderHook(() => useToolStore());

      // When
      act(() => {
        result.current.updateInstallLoadingState(pluginIdentifier, loadingState);
      });

      // Then
      expect(result.current.pluginInstallLoading[pluginIdentifier]).toBe(loadingState);
    });
  });
});
