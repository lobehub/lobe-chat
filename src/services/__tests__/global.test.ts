import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { globalService } from '../global';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GlobalService', () => {
  describe('getLatestVersion', () => {
    it('should return the latest version when fetch is successful', async () => {
      // Arrange
      const mockVersion = '1.0.0';
      (fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve({ 'dist-tags': { latest: mockVersion } }),
      });

      // Act
      const version = await globalService.getLatestVersion();

      // Assert
      expect(fetch).toHaveBeenCalledWith('https://registry.npmmirror.com/@lobehub/chat');
      expect(version).toBe(mockVersion);
    });

    it('should return undefined if the latest version is not found in the response', async () => {
      // Arrange
      (fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve({}),
      });

      // Act
      const version = await globalService.getLatestVersion();

      // Assert
      expect(version).toBeUndefined();
    });

    it('should throw an error when the fetch call fails', async () => {
      // Arrange
      (fetch as Mock).mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(globalService.getLatestVersion()).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses gracefully', async () => {
      // Arrange
      (fetch as Mock).mockResolvedValue({
        json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON at position 0')),
      });

      // Act & Assert
      await expect(globalService.getLatestVersion()).rejects.toThrow(SyntaxError);
    });
  });

  describe('ServerConfig', () => {
    it('should return the serverConfig when fetch is successful', async () => {
      // Arrange
      (fetch as Mock).mockResolvedValue({
        json: () => Promise.resolve({ customModelName: 'abc' }),
      });

      // Act
      const config = await globalService.getGlobalConfig();

      // Assert
      expect(config).toEqual({ customModelName: 'abc' });
    });
  });
});
