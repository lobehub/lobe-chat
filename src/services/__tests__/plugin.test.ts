import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getPluginIndexJSON } from '@/const/url';
import { getCurrentLanguage } from '@/store/global/helpers';

import { pluginService } from '../plugin';

// Mocking modules and functions
vi.mock('@/const/url', () => ({
  getPluginIndexJSON: vi.fn(),
}));
vi.mock('@/store/global/helpers', () => ({
  getCurrentLanguage: vi.fn(),
}));

describe('PluginService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getPluginList', () => {
    it('should fetch and return the plugin list', async () => {
      // Arrange
      const fakeResponse = { plugins: [{ name: 'TestPlugin' }] };
      const fakeUrl = 'http://fake-url.com/plugins.json';
      (getCurrentLanguage as Mock).mockReturnValue('en');
      (getPluginIndexJSON as Mock).mockReturnValue(fakeUrl);
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(fakeResponse),
        }),
      ) as any;

      // Act
      const pluginList = await pluginService.getPluginList();

      // Assert
      expect(getCurrentLanguage).toHaveBeenCalled();
      expect(getPluginIndexJSON).toHaveBeenCalledWith('en');
      expect(fetch).toHaveBeenCalledWith(fakeUrl);
      expect(pluginList).toEqual(fakeResponse);
    });

    it('should handle fetch error', async () => {
      // Arrange
      const fakeUrl = 'http://fake-url.com/plugins.json';
      (getCurrentLanguage as Mock).mockReturnValue('en');
      (getPluginIndexJSON as Mock).mockReturnValue(fakeUrl);
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      // Act & Assert
      await expect(pluginService.getPluginList()).rejects.toThrow('Network error');
    });
  });

  describe('fetchManifest', () => {
    it('should fetch and return the plugin manifest', async () => {
      // Arrange
      const fakeManifest = { name: 'TestPlugin', version: '1.0.0' };
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(fakeManifest),
        }),
      ) as any;

      // Act
      const manifest = await pluginService.fetchManifest(manifestUrl);

      // Assert
      expect(fetch).toHaveBeenCalledWith(manifestUrl);
      expect(manifest).toEqual(fakeManifest);
    });

    it('should return null on fetch error', async () => {
      // Arrange
      const manifestUrl = 'http://fake-url.com/manifest.json';
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      // Act
      const manifest = await pluginService.fetchManifest(manifestUrl);

      // Assert
      expect(fetch).toHaveBeenCalledWith(manifestUrl);
      expect(manifest).toBeNull();
    });
  });
});
