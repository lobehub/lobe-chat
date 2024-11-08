// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { getCanonicalUrl } from '@/server/utils/url';
import { AssistantCategory, PluginCategory } from '@/types/discover';

import { LAST_MODIFIED, Sitemap, SitemapType } from './sitemap';

describe('Sitemap', () => {
  const sitemap = new Sitemap();

  describe('getIndex', () => {
    it('should return a valid sitemap index', () => {
      const index = sitemap.getIndex();
      expect(index).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(index).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      [
        SitemapType.Pages,
        SitemapType.Assistants,
        SitemapType.Plugins,
        SitemapType.Models,
        SitemapType.Providers,
      ].forEach((type) => {
        expect(index).toContain(`<loc>${getCanonicalUrl(`/sitemap/${type}.xml`)}</loc>`);
      });
      expect(index).toContain(`<lastmod>${LAST_MODIFIED}</lastmod>`);
    });
  });

  describe('getPage', () => {
    it('should return a valid page sitemap', async () => {
      const pageSitemap = await sitemap.getPage();
      expect(pageSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/'),
          changeFrequency: 'monthly',
          priority: 0.4,
        }),
      );
      expect(pageSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover'),
          changeFrequency: 'daily',
          priority: 0.7,
        }),
      );
      Object.values(AssistantCategory).forEach((category) => {
        expect(pageSitemap).toContainEqual(
          expect.objectContaining({
            url: getCanonicalUrl(`/discover/assistants/${category}`),
            changeFrequency: 'daily',
            priority: 0.7,
          }),
        );
      });
      Object.values(PluginCategory).forEach((category) => {
        expect(pageSitemap).toContainEqual(
          expect.objectContaining({
            url: getCanonicalUrl(`/discover/plugins/${category}`),
            changeFrequency: 'daily',
            priority: 0.7,
          }),
        );
      });
    });
  });

  describe('getAssistants', () => {
    it('should return a valid assistants sitemap', async () => {
      vi.spyOn(sitemap['discoverService'], 'getAssistantList').mockResolvedValue([
        // @ts-ignore
        { identifier: 'test-assistant', createdAt: '2023-01-01' },
      ]);

      const assistantsSitemap = await sitemap.getAssistants();
      expect(assistantsSitemap.length).toBe(15);
      expect(assistantsSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/assistant/test-assistant'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
      expect(assistantsSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/assistant/test-assistant?hl=zh-CN'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
    });
  });

  describe('getPlugins', () => {
    it('should return a valid plugins sitemap', async () => {
      vi.spyOn(sitemap['discoverService'], 'getPluginList').mockResolvedValue([
        // @ts-ignore
        { identifier: 'test-plugin', createdAt: '2023-01-01' },
      ]);

      const pluginsSitemap = await sitemap.getPlugins();
      expect(pluginsSitemap.length).toBe(15);
      expect(pluginsSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/plugin/test-plugin'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
      expect(pluginsSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/plugin/test-plugin?hl=ja-JP'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
    });
  });

  describe('getModels', () => {
    it('should return a valid models sitemap', async () => {
      vi.spyOn(sitemap['discoverService'], 'getModelList').mockResolvedValue([
        // @ts-ignore
        { identifier: 'test:model', createdAt: '2023-01-01' },
      ]);

      const modelsSitemap = await sitemap.getModels();
      expect(modelsSitemap.length).toBe(15);
      expect(modelsSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/model/test:model'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
      expect(modelsSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/model/test:model?hl=ko-KR'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
    });
  });

  describe('getProviders', () => {
    it('should return a valid providers sitemap', async () => {
      vi.spyOn(sitemap['discoverService'], 'getProviderList').mockResolvedValue([
        // @ts-ignore
        { identifier: 'test-provider', createdAt: '2023-01-01' },
      ]);

      const providersSitemap = await sitemap.getProviders();
      expect(providersSitemap.length).toBe(15);
      expect(providersSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/provider/test-provider'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
      expect(providersSitemap).toContainEqual(
        expect.objectContaining({
          url: getCanonicalUrl('/discover/provider/test-provider?hl=ar'),
          lastModified: '2023-01-01T00:00:00.000Z',
        }),
      );
    });
  });

  describe('getRobots', () => {
    it('should return correct robots.txt entries', () => {
      const robots = sitemap.getRobots();
      expect(robots).toContain(getCanonicalUrl('/sitemap-index.xml'));
      [
        SitemapType.Pages,
        SitemapType.Assistants,
        SitemapType.Plugins,
        SitemapType.Models,
        SitemapType.Providers,
      ].forEach((type) => {
        expect(robots).toContain(getCanonicalUrl(`/sitemap/${type}.xml`));
      });
    });
  });
});
