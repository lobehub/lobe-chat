// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { SitemapType, sitemapModule } from '@/server/sitemap';

import sitemap, { generateSitemaps, parsePaginatedId } from './sitemap';

// Mock the sitemapModule methods
vi.mock('@/server/sitemap', () => ({
  SitemapType: {
    Pages: 'pages',
    Assistants: 'assistants',
    Mcp: 'mcp',
    Plugins: 'plugins',
    Models: 'models',
    Providers: 'providers',
  },
  sitemapModule: {
    sitemapIndexs: [{ id: 'pages' }, { id: 'providers' }],
    getPluginPageCount: vi.fn(),
    getAssistantPageCount: vi.fn(),
    getMcpPageCount: vi.fn(),
    getModelPageCount: vi.fn(),
    getPage: vi.fn(),
    getAssistants: vi.fn(),
    getMcp: vi.fn(),
    getPlugins: vi.fn(),
    getModels: vi.fn(),
    getProviders: vi.fn(),
  },
  LAST_MODIFIED: '2023-01-01T00:00:00.000Z',
}));

describe('App Sitemap', () => {
  describe('generateSitemaps', () => {
    it('should generate sitemaps with pagination', async () => {
      // Mock page counts
      vi.mocked(sitemapModule.getPluginPageCount).mockResolvedValue(2);
      vi.mocked(sitemapModule.getAssistantPageCount).mockResolvedValue(3);
      vi.mocked(sitemapModule.getMcpPageCount).mockResolvedValue(1);
      vi.mocked(sitemapModule.getModelPageCount).mockResolvedValue(2);

      const result = await generateSitemaps();

      expect(result).toEqual([
        { id: 'pages' },
        { id: 'providers' },
        { id: 'plugins-1' },
        { id: 'plugins-2' },
        { id: 'assistants-1' },
        { id: 'assistants-2' },
        { id: 'assistants-3' },
        { id: 'mcp-1' },
        { id: 'models-1' },
        { id: 'models-2' },
      ]);

      expect(sitemapModule.getPluginPageCount).toHaveBeenCalled();
      expect(sitemapModule.getAssistantPageCount).toHaveBeenCalled();
      expect(sitemapModule.getMcpPageCount).toHaveBeenCalled();
      expect(sitemapModule.getModelPageCount).toHaveBeenCalled();
    });
  });

  describe('parsePaginatedId', () => {
    it('should parse paginated ID correctly', () => {
      expect(parsePaginatedId('plugins-1')).toEqual({
        type: 'plugins',
        page: 1,
      });

      expect(parsePaginatedId('assistants-3')).toEqual({
        type: 'assistants',
        page: 3,
      });

      expect(parsePaginatedId('mcp-2')).toEqual({
        type: 'mcp',
        page: 2,
      });

      expect(parsePaginatedId('models-5')).toEqual({
        type: 'models',
        page: 5,
      });
    });

    it('should parse non-paginated ID correctly', () => {
      expect(parsePaginatedId('pages')).toEqual({
        type: 'pages',
      });

      expect(parsePaginatedId('providers')).toEqual({
        type: 'providers',
      });
    });

    it('should handle invalid paginated ID', () => {
      expect(parsePaginatedId('plugins-invalid')).toEqual({
        type: 'plugins-invalid',
      });
    });
  });

  describe('sitemap', () => {
    it('should handle static sitemap types', async () => {
      vi.mocked(sitemapModule.getPage).mockResolvedValue([]);
      vi.mocked(sitemapModule.getProviders).mockResolvedValue([]);

      await sitemap({ id: 'pages' });
      expect(sitemapModule.getPage).toHaveBeenCalled();

      await sitemap({ id: 'providers' });
      expect(sitemapModule.getProviders).toHaveBeenCalled();
    });

    it('should handle paginated sitemap types', async () => {
      vi.mocked(sitemapModule.getAssistants).mockResolvedValue([]);
      vi.mocked(sitemapModule.getMcp).mockResolvedValue([]);
      vi.mocked(sitemapModule.getPlugins).mockResolvedValue([]);
      vi.mocked(sitemapModule.getModels).mockResolvedValue([]);

      await sitemap({ id: 'assistants-1' });
      expect(sitemapModule.getAssistants).toHaveBeenCalledWith(1);

      await sitemap({ id: 'mcp-2' });
      expect(sitemapModule.getMcp).toHaveBeenCalledWith(2);

      await sitemap({ id: 'plugins-3' });
      expect(sitemapModule.getPlugins).toHaveBeenCalledWith(3);

      await sitemap({ id: 'models-1' });
      expect(sitemapModule.getModels).toHaveBeenCalledWith(1);
    });

    it('should handle paginated sitemap types in default case', async () => {
      vi.mocked(sitemapModule.getPlugins).mockResolvedValue([]);
      vi.mocked(sitemapModule.getAssistants).mockResolvedValue([]);
      vi.mocked(sitemapModule.getMcp).mockResolvedValue([]);
      vi.mocked(sitemapModule.getModels).mockResolvedValue([]);

      await sitemap({ id: 'plugins-5' });
      expect(sitemapModule.getPlugins).toHaveBeenCalledWith(5);

      await sitemap({ id: 'assistants-10' });
      expect(sitemapModule.getAssistants).toHaveBeenCalledWith(10);

      await sitemap({ id: 'mcp-7' });
      expect(sitemapModule.getMcp).toHaveBeenCalledWith(7);

      await sitemap({ id: 'models-3' });
      expect(sitemapModule.getModels).toHaveBeenCalledWith(3);
    });

    it('should return empty array for unknown sitemap type', async () => {
      const result = await sitemap({ id: 'unknown-type' });
      expect(result).toEqual([]);
    });

    it('should handle non-paginated sitemap types correctly', async () => {
      vi.mocked(sitemapModule.getAssistants).mockResolvedValue([]);
      vi.mocked(sitemapModule.getMcp).mockResolvedValue([]);
      vi.mocked(sitemapModule.getPlugins).mockResolvedValue([]);
      vi.mocked(sitemapModule.getModels).mockResolvedValue([]);

      await sitemap({ id: 'assistants' });
      expect(sitemapModule.getAssistants).toHaveBeenCalledWith(undefined);

      await sitemap({ id: 'mcp' });
      expect(sitemapModule.getMcp).toHaveBeenCalledWith(undefined);

      await sitemap({ id: 'plugins' });
      expect(sitemapModule.getPlugins).toHaveBeenCalledWith(undefined);

      await sitemap({ id: 'models' });
      expect(sitemapModule.getModels).toHaveBeenCalledWith(undefined);
    });
  });
});
