import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { edgeClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';

import { assistantService } from '../assistant';

// Mocking modules and functions

vi.mock('@/store/global/helpers', () => ({
  globalHelpers: {
    getCurrentLanguage: vi.fn(),
  },
}));

vi.mock('@/libs/trpc/client', () => ({
  edgeClient: {
    market: {
      getAgentIndex: {
        query: vi.fn(),
      },
      getAgent: {
        query: vi.fn(),
      },
    },
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

      (edgeClient.market.getAgentIndex.query as Mock).mockResolvedValue(fakeResponse);

      // Act
      const assistantList = await assistantService.getAssistantList();

      // Assert
      expect(globalHelpers.getCurrentLanguage).toHaveBeenCalled();
      expect(assistantList).toEqual(fakeResponse.agents);
    });

    it('should handle fetch error', async () => {
      // Arrange
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('en');
      (edgeClient.market.getAgentIndex.query as Mock).mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(assistantService.getAssistantList()).rejects.toThrow('Network error');
    });
  });

  describe('getAssistantById', () => {
    it('should fetch and return the assistant by id', async () => {
      // Arrange
      const fakeResponse = { identifier: 'test-assisstant' };
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('tt');

      (edgeClient.market.getAgent.query as Mock).mockResolvedValue(fakeResponse);

      // Act
      const assistant = await assistantService.getAssistantById('test-assisstant');

      // Assert
      expect(globalHelpers.getCurrentLanguage).toHaveBeenCalled();
      expect(assistant.identifier).toEqual(fakeResponse.identifier);
    });

    it('should handle fetch error', async () => {
      // Arrange
      (globalHelpers.getCurrentLanguage as Mock).mockReturnValue('en');
      (edgeClient.market.getAgent.query as Mock).mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(assistantService.getAssistantById('test-assisstant')).rejects.toThrow(
        'Network error',
      );
    });
  });
});
