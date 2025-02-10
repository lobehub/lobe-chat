import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { globalHelpers } from '@/store/global/helpers';

import { assistantService } from '../assistant';

// Mocking modules and functions

vi.mock('@/store/global/helpers', () => ({
  globalHelpers: {
    getCurrentLanguage: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('AssistantService', () => {
  describe('getAssistantList', () => {
    it('should fetch and return the assistant list', async () => {
      // Arrange
      const fakeResponse = { agents: [{ name: 'TestAssisstant' }] };
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('tt');
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(fakeResponse),
        }),
      ) as any;

      // Act
      const assistantList = await assistantService.getAssistantList();

      // Assert
      expect(globalHelpers.getCurrentLanguage).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('/webapi/assistant/store?locale=tt');
      expect(assistantList).toEqual(fakeResponse.agents);
    });

    it('should handle fetch error', async () => {
      // Arrange
      const fakeUrl = 'http://fake-url.com/plugins.json';
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('en');
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      // Act & Assert
      await expect(assistantService.getAssistantList()).rejects.toThrow('Network error');
    });
  });
  describe('getAssistantList', () => {
    it('should fetch and return the assistant list', async () => {
      // Arrange
      const fakeResponse = { identifier: 'test-assisstant' };
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('tt');
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(fakeResponse),
        }),
      ) as any;

      // Act
      const assistant = await assistantService.getAssistantById('test-assisstant');

      // Assert
      expect(globalHelpers.getCurrentLanguage).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('/webapi/assistant/test-assisstant?locale=tt');
      expect(assistant.identifier).toEqual(fakeResponse.identifier);
    });

    it('should handle fetch error', async () => {
      // Arrange
      const fakeUrl = 'http://fake-url.com/plugins.json';
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('en');
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      // Act & Assert
      await expect(assistantService.getAssistantById('test-assisstant')).rejects.toThrow(
        'Network error',
      );
    });
  });
});
