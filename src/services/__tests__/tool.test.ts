import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { globalHelpers } from '@/store/user/helpers';

import { toolService } from '../tool';
import openAPIV3 from './openai/OpenAPI_V3.json';
import OpenAIPlugin from './openai/plugin.json';

// Mocking modules and functions

vi.mock('@/store/user/helpers', () => ({
  globalHelpers: {
    getCurrentLanguage: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ToolService', () => {
  describe('getPluginList', () => {
    it('should fetch and return the plugin list', async () => {
      // Arrange
      const fakeResponse = { plugins: [{ name: 'TestPlugin' }] };
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('tt');
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(fakeResponse),
        }),
      ) as any;

      // Act
      const pluginList = await toolService.getPluginList();

      // Assert
      expect(globalHelpers.getCurrentLanguage).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('/api/plugin/store?locale=tt');
      expect(pluginList).toEqual(fakeResponse);
    });

    it('should handle fetch error', async () => {
      // Arrange
      const fakeUrl = 'http://fake-url.com/plugins.json';
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('en');
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      // Act & Assert
      await expect(toolService.getPluginList()).rejects.toThrow('Network error');
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
          headers: new Headers({ 'content-type': 'application/json' }),
          ok: true,
          json: () => Promise.resolve(fakeManifest),
        }),
      ) as any;

      const manifest = await toolService.getPluginManifest(manifestUrl);

      expect(fetch).toHaveBeenCalledWith(manifestUrl);
      expect(manifest).toEqual(fakeManifest);
    });

    it('should return error on noManifest', async () => {
      try {
        await toolService.getPluginManifest();
      } catch (e) {
        expect(e).toEqual(new TypeError('noManifest'));
      }
    });

    it('should return error on manifestInvalid', async () => {
      const fakeManifest = { name: 'TestPlugin', version: '1.0.0' };
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() =>
        Promise.resolve({
          headers: new Headers({ 'content-type': 'application/json' }),
          ok: true,
          json: () => Promise.resolve(fakeManifest),
        }),
      ) as any;

      try {
        await toolService.getPluginManifest(manifestUrl);
      } catch (e) {
        expect(e).toEqual(new TypeError('manifestInvalid'));
      }
    });

    it('should return error on fetchError', async () => {
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      try {
        await toolService.getPluginManifest(manifestUrl);
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
          headers: new Headers({ 'content-type': 'application/json' }),
          ok: true,
          json: () => {
            throw new Error('abc');
          },
        }),
      ) as any;

      try {
        await toolService.getPluginManifest(manifestUrl);
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
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve(fakeManifest),
        }),
      ) as any;

      try {
        await toolService.getPluginManifest(manifestUrl);
      } catch (e) {
        expect(e).toEqual(new TypeError('fetchError'));
      }
    });

    describe('support OpenAPI manifest', () => {
      it('should get plugin manifest', async () => {
        const manifestUrl = 'http://fake-url.com/manifest.json';
        const openapiUrl = 'http://fake-url.com/openapiUrl.json';

        const fakeManifest = {
          $schema: '../node_modules/@lobehub/chat-plugin-sdk/schema.json',
          api: [],
          openapi: openapiUrl,
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

        global.fetch = vi.fn((url) =>
          Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () => Promise.resolve(url === openapiUrl ? openAPIV3 : fakeManifest),
          }),
        ) as any;

        const manifest = await toolService.getPluginManifest(manifestUrl);

        expect(manifest).toMatchSnapshot();
      });

      it('should return error on openAPIInvalid', async () => {
        const openapiUrl = 'http://fake-url.com/openapiUrl.json';
        const manifestUrl = 'http://fake-url.com/manifest.json';
        const fakeManifest = {
          $schema: '../node_modules/@lobehub/chat-plugin-sdk/schema.json',
          api: [],
          openapi: openapiUrl,
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

        global.fetch = vi.fn((url) =>
          Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () => Promise.resolve(url === openapiUrl ? [] : fakeManifest),
          }),
        ) as any;

        try {
          await toolService.getPluginManifest(manifestUrl);
        } catch (e) {
          expect(e).toEqual(new TypeError('openAPIInvalid'));
        }
      });
    });
  });

  it('can parse the OpenAI plugin', async () => {
    const manifest = toolService['convertOpenAIManifestToLobeManifest'](OpenAIPlugin as any);

    expect(manifest).toMatchSnapshot();
  });
});
