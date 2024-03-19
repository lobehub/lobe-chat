import { Mock, describe, expect, it, vi } from 'vitest';

import { ollamaService } from '../ollama';

vi.stubGlobal('fetch', vi.fn());

describe('OllamaService', () => {
  describe('list models', async () => {
    it('should make a GET request with the correct payload', async () => {
      (fetch as Mock).mockResolvedValueOnce(new Response(JSON.stringify({ models: [] })));

      expect(await ollamaService.getModels()).toEqual({ models: [] });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should make a GET request with the error', async () => {
      const mockResponse = new Response(null, { status: 503 });
      (fetch as Mock).mockResolvedValueOnce(mockResponse);

      await expect(ollamaService.getModels()).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
