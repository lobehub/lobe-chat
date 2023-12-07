import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';
import { act } from '@testing-library/react';
import { notification } from 'antd';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getPluginIndexJSON } from '@/const/url';
import { globalHelpers } from '@/store/global/helpers';
import { useToolStore } from '@/store/tool';

import { pluginService } from '../plugin';

// Mocking modules and functions
vi.mock('@/const/url', () => ({
  getPluginIndexJSON: vi.fn(),
}));
vi.mock('@/store/global/helpers', () => ({
  globalHelpers: {
    getCurrentLanguage: vi.fn(),
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
});
