// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { SearXNGClient } from './client';
import { hetongxue } from './fixtures/searXNG';
import { SearXNGImpl } from './index';

vi.mock('@/config/tools', () => ({
  toolsEnv: {
    SEARXNG_URL: 'https://demo.com',
  },
}));

describe('SearXNGImpl', () => {
  describe('query', () => {
    it('搜索结果超过10个', async () => {
      vi.spyOn(SearXNGClient.prototype, 'search').mockResolvedValueOnce(hetongxue);

      const searchImpl = new SearXNGImpl();
      const results = await searchImpl.query('何同学');

      // Assert
      expect(results.results.length).toEqual(43);
    });

    it('应该将搜索类别"it"替换为"general"', async () => {
      const mockSearch = vi
        .spyOn(SearXNGClient.prototype, 'search')
        .mockResolvedValueOnce(hetongxue);

      const searchImpl = new SearXNGImpl();
      await searchImpl.query('test query', {
        searchCategories: ['it', 'images', 'it'],
      });

      // Assert search was called with correct categories
      expect(mockSearch).toHaveBeenCalledWith(
        'test query',
        expect.objectContaining({
          categories: ['general', 'images'],
        }),
      );
    });
  });
});
