import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { getPluginIndexJSON } from '@/const/url';
import { PluginModel } from '@/database/models/plugin';
import { DB_Plugin } from '@/database/schemas/plugin';
import { globalHelpers } from '@/store/global/helpers';
import { LobeTool } from '@/types/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

import { InstallPluginParams, pluginService } from '../plugin';
import OpenAPIV2 from './openapi/OpenAPI_V2.json';
import openAPIV3 from './openapi/OpenAPI_V3.json';

// Mocking modules and functions
vi.mock('@/const/url', () => ({
  getPluginIndexJSON: vi.fn(),
}));
vi.mock('@/store/global/helpers', () => ({
  globalHelpers: {
    getCurrentLanguage: vi.fn(),
  },
}));
vi.mock('@/database/models/plugin', () => ({
  PluginModel: {
    getList: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    clear: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('PluginService', () => {
  describe('getPluginList', () => {
    it('should fetch and return the plugin list', async () => {
      // Arrange
      const fakeResponse = { plugins: [{ name: 'TestPlugin' }] };
      const fakeUrl = 'http://fake-url.com/plugins.json';
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('en');
      (getPluginIndexJSON as Mock).mockReturnValue(fakeUrl);
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(fakeResponse),
        }),
      ) as any;

      // Act
      const pluginList = await pluginService.getPluginList();

      // Assert
      expect(globalHelpers.getCurrentLanguage).toHaveBeenCalled();
      expect(getPluginIndexJSON).toHaveBeenCalledWith('en');
      expect(fetch).toHaveBeenCalledWith(fakeUrl);
      expect(pluginList).toEqual(fakeResponse);
    });

    it('should handle fetch error', async () => {
      // Arrange
      const fakeUrl = 'http://fake-url.com/plugins.json';
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('en');
      (getPluginIndexJSON as Mock).mockReturnValue(fakeUrl);
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      // Act & Assert
      await expect(pluginService.getPluginList()).rejects.toThrow('Network error');
    });
  });

  describe('getPluginManifest', () => {
    it('should return manifest', async () => {
      const manifestUrl = 'http://fake-url.com/manifest.json';

      const fakeManifest = {
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

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeManifest),
        }),
      ) as any;

      const manifest = await pluginService.getPluginManifest(manifestUrl);

      expect(fetch).toHaveBeenCalledWith(manifestUrl);
      expect(manifest).toEqual(fakeManifest);
    });

    it('should return error on noManifest', async () => {
      try {
        await pluginService.getPluginManifest();
      } catch (e) {
        expect(e).toEqual(new TypeError('noManifest'));
      }
    });

    it('should return error on manifestInvalid', async () => {
      const fakeManifest = { name: 'TestPlugin', version: '1.0.0' };
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(fakeManifest),
        }),
      ) as any;

      try {
        await pluginService.getPluginManifest(manifestUrl);
      } catch (e) {
        expect(e).toEqual(new TypeError('manifestInvalid'));
      }
    });

    it('should return error on fetchError', async () => {
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      try {
        await pluginService.getPluginManifest(manifestUrl);
      } catch (e) {
        expect(e).toEqual(new TypeError('fetchError'));
      }
      expect(fetch).toHaveBeenCalledWith(manifestUrl);
    });

    it('should return error on manifestInvalid', async () => {
      const fakeManifest = { name: 'TestPlugin', version: '1.0.0' };
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => {
            throw new Error('abc');
          },
        }),
      ) as any;

      try {
        await pluginService.getPluginManifest(manifestUrl);
      } catch (e) {
        expect(e).toEqual(new TypeError('urlError'));
      }
    });

    it('should return error on manifestInvalid', async () => {
      const fakeManifest = { name: 'TestPlugin', version: '1.0.0' };
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve(fakeManifest),
        }),
      ) as any;

      try {
        await pluginService.getPluginManifest(manifestUrl);
      } catch (e) {
        expect(e).toEqual(new TypeError('fetchError'));
      }
    });
  });

  describe('installPlugin', () => {
    it('should install a plugin', async () => {
      // Arrange
      const fakePlugin = {
        identifier: 'test-plugin',
        manifest: { name: 'TestPlugin', version: '1.0.0' } as unknown as LobeChatPluginManifest,
        type: 'plugin',
      } as InstallPluginParams;
      vi.mocked(PluginModel.create).mockResolvedValue(fakePlugin);

      // Act
      const installedPlugin = await pluginService.installPlugin(fakePlugin);

      // Assert
      expect(PluginModel.create).toHaveBeenCalledWith(fakePlugin);
      expect(installedPlugin).toEqual(fakePlugin);
    });
  });

  describe('getInstalledPlugins', () => {
    it('should return a list of installed plugins', async () => {
      // Arrange
      const fakePlugins = [{ identifier: 'test-plugin', type: 'plugin' }] as LobeTool[];
      vi.mocked(PluginModel.getList).mockResolvedValue(fakePlugins as DB_Plugin[]);

      // Act
      const installedPlugins = await pluginService.getInstalledPlugins();

      // Assert
      expect(PluginModel.getList).toHaveBeenCalled();
      expect(installedPlugins).toEqual(fakePlugins);
    });
  });

  describe('uninstallPlugin', () => {
    it('should uninstall a plugin', async () => {
      // Arrange
      const identifier = 'test-plugin';
      vi.mocked(PluginModel.delete).mockResolvedValue();

      // Act
      const result = await pluginService.uninstallPlugin(identifier);

      // Assert
      expect(PluginModel.delete).toHaveBeenCalledWith(identifier);
      expect(result).toBe(undefined);
    });
  });

  describe('createCustomPlugin', () => {
    it('should create a custom plugin', async () => {
      // Arrange
      const customPlugin = {
        identifier: 'custom-plugin',
        manifest: {},
        type: 'customPlugin',
      } as LobeToolCustomPlugin;
      vi.mocked(PluginModel.create).mockResolvedValue(customPlugin);

      // Act
      const result = await pluginService.createCustomPlugin(customPlugin);

      // Assert
      expect(PluginModel.create).toHaveBeenCalledWith({
        ...customPlugin,
        type: 'customPlugin',
      });
      expect(result).toEqual(customPlugin);
    });
  });

  describe('updatePlugin', () => {
    it('should update a plugin', async () => {
      // Arrange
      const id = 'plugin-id';
      const value = { settings: { ab: '1' } } as unknown as LobeToolCustomPlugin;
      vi.mocked(PluginModel.update).mockResolvedValue(1);

      // Act
      const result = await pluginService.updatePlugin(id, value);

      // Assert
      expect(PluginModel.update).toHaveBeenCalledWith(id, value);
      expect(result).toEqual(1);
    });
  });

  describe('updatePluginManifest', () => {
    it('should update a plugin manifest', async () => {
      // Arrange
      const id = 'plugin-id';
      const manifest = { name: 'NewPluginManifest' } as unknown as LobeChatPluginManifest;
      vi.mocked(PluginModel.update).mockResolvedValue(1);

      // Act
      const result = await pluginService.updatePluginManifest(id, manifest);

      // Assert
      expect(PluginModel.update).toHaveBeenCalledWith(id, { manifest });
      expect(result).toEqual(1);
    });
  });

  describe('removeAllPlugins', () => {
    it('should remove all plugins', async () => {
      // Arrange
      vi.mocked(PluginModel.clear).mockResolvedValue(undefined);

      // Act
      const result = await pluginService.removeAllPlugins();

      // Assert
      expect(PluginModel.clear).toHaveBeenCalled();
      expect(result).toBe(undefined);
    });
  });

  describe('updatePluginSettings', () => {
    it('should update plugin settings', async () => {
      // Arrange
      const id = 'plugin-id';
      const settings = { color: 'blue' };
      vi.mocked(PluginModel.update).mockResolvedValue(1);

      // Act
      const result = await pluginService.updatePluginSettings(id, settings);

      // Assert
      expect(PluginModel.update).toHaveBeenCalledWith(id, { settings });
      expect(result).toEqual(1);
    });
  });

  describe('convertOpenAPIToPluginSchema', () => {
    it('can convert OpenAPI v3.1 to lobe apis', async () => {
      const plugins = await pluginService.convertOpenAPIToPluginSchema(openAPIV3);

      expect(plugins).toMatchSnapshot();
    });

    it('can convert OpenAPI v2 MJ openAPI', async () => {
      const plugins = await pluginService.convertOpenAPIToPluginSchema(OpenAPIV2);

      expect(plugins).toMatchSnapshot();
    });
  });
});
