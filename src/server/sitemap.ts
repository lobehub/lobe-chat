import { flatten } from 'lodash-es';
import { MetadataRoute } from 'next';
import qs from 'query-string';
import urlJoin from 'url-join';

import { serverFeatureFlags } from '@/config/featureFlags';
import { DEFAULT_LANG } from '@/const/locale';
import { SITEMAP_BASE_URL } from '@/const/url';
import { Locales, locales as allLocales } from '@/locales/resources';
import { DiscoverService } from '@/server/services/discover';
import { getCanonicalUrl } from '@/server/utils/url';
import { AssistantCategory, PluginCategory } from '@/types/discover';
import { isDev } from '@/utils/env';

export interface SitemapItem {
  alternates?: {
    languages?: string;
  };
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified?: string | Date;
  priority?: number;
  url: string;
}

export enum SitemapType {
  Assistants = 'assistants',
  Models = 'models',
  Pages = 'pages',
  Plugins = 'plugins',
  Providers = 'providers',
}

export const LAST_MODIFIED = new Date().toISOString();

export class Sitemap {
  sitemapIndexs = [
    { id: SitemapType.Pages },
    { id: SitemapType.Assistants },
    { id: SitemapType.Plugins },
    { id: SitemapType.Models },
    { id: SitemapType.Providers },
  ];

  private discoverService = new DiscoverService();

  private _generateSitemapLink(url: string) {
    return [
      '<sitemap>',
      `<loc>${url}</loc>`,
      `<lastmod>${LAST_MODIFIED}</lastmod>`,
      '</sitemap>',
    ].join('\n');
  }

  private _formatTime(time?: string) {
    try {
      if (!time) return LAST_MODIFIED;
      return new Date(time).toISOString() || LAST_MODIFIED;
    } catch {
      return LAST_MODIFIED;
    }
  }

  private _genSitemapItem = (
    lang: Locales,
    url: string,
    {
      lastModified,
      changeFrequency = 'monthly',
      priority = 0.4,
      noLocales,
      locales = allLocales,
    }: {
      changeFrequency?: SitemapItem['changeFrequency'];
      lastModified?: string;
      locales?: typeof allLocales;
      noLocales?: boolean;
      priority?: number;
    } = {},
  ) => {
    const sitemap = {
      changeFrequency,
      lastModified: this._formatTime(lastModified),
      priority,
      url:
        lang === DEFAULT_LANG
          ? getCanonicalUrl(url)
          : qs.stringifyUrl({ query: { hl: lang }, url: getCanonicalUrl(url) }),
    };
    if (noLocales) return sitemap;

    const languages: any = {};
    for (const locale of locales) {
      if (locale === lang) continue;
      languages[locale] = qs.stringifyUrl({
        query: { hl: locale },
        url: getCanonicalUrl(url),
      });
    }
    return {
      alternates: {
        languages,
      },
      ...sitemap,
    };
  };

  private _genSitemap(
    url: string,
    {
      lastModified,
      changeFrequency = 'monthly',
      priority = 0.4,
      noLocales,
      locales = allLocales,
    }: {
      changeFrequency?: SitemapItem['changeFrequency'];
      lastModified?: string;
      locales?: typeof allLocales;
      noLocales?: boolean;
      priority?: number;
    } = {},
  ) {
    if (noLocales)
      return [
        this._genSitemapItem(DEFAULT_LANG, url, {
          changeFrequency,
          lastModified,
          locales,
          noLocales,
          priority,
        }),
      ];
    return locales.map((lang) =>
      this._genSitemapItem(lang, url, {
        changeFrequency,
        lastModified,
        locales,
        noLocales,
        priority,
      }),
    );
  }

  getIndex(): string {
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...this.sitemapIndexs.map((item) =>
        this._generateSitemapLink(
          getCanonicalUrl(SITEMAP_BASE_URL, isDev ? item.id : `${item.id}.xml`),
        ),
      ),
      '</sitemapindex>',
    ].join('\n');
  }

  async getAssistants(): Promise<MetadataRoute.Sitemap> {
    const list = await this.discoverService.getAssistantList(DEFAULT_LANG);
    const sitmap = list.map((item) =>
      this._genSitemap(urlJoin('/discover/assistant', item.identifier), {
        lastModified: item?.createdAt || LAST_MODIFIED,
      }),
    );
    return flatten(sitmap);
  }

  async getPlugins(): Promise<MetadataRoute.Sitemap> {
    const list = await this.discoverService.getPluginList(DEFAULT_LANG);
    const sitmap = list.map((item) =>
      this._genSitemap(urlJoin('/discover/plugin', item.identifier), {
        lastModified: item?.createdAt || LAST_MODIFIED,
      }),
    );
    return flatten(sitmap);
  }

  async getModels(): Promise<MetadataRoute.Sitemap> {
    const list = await this.discoverService.getModelList(DEFAULT_LANG);
    const sitmap = list.map((item) =>
      this._genSitemap(urlJoin('/discover/model', item.identifier), {
        lastModified: item?.createdAt || LAST_MODIFIED,
      }),
    );
    return flatten(sitmap);
  }

  async getProviders(): Promise<MetadataRoute.Sitemap> {
    const list = await this.discoverService.getProviderList(DEFAULT_LANG);
    const sitmap = list.map((item) =>
      this._genSitemap(urlJoin('/discover/provider', item.identifier), {
        lastModified: item?.createdAt || LAST_MODIFIED,
      }),
    );
    return flatten(sitmap);
  }

  async getPage(): Promise<MetadataRoute.Sitemap> {
    const hideDocs = serverFeatureFlags().hideDocs;
    const assistantsCategory = Object.values(AssistantCategory);
    const pluginCategory = Object.values(PluginCategory);
    const modelCategory = await this.discoverService.getProviderList(DEFAULT_LANG);
    return [
      ...this._genSitemap('/', { noLocales: true }),
      ...this._genSitemap('/chat', { noLocales: true }),
      ...(!hideDocs ? this._genSitemap('/changelog', { noLocales: true }) : []),
      /* ↓ cloud slot ↓ */

      /* ↑ cloud slot ↑ */
      ...this._genSitemap('/discover', { changeFrequency: 'daily', priority: 0.7 }),
      ...this._genSitemap('/discover/assistants', { changeFrequency: 'daily', priority: 0.7 }),
      ...assistantsCategory.flatMap((slug) =>
        this._genSitemap(`/discover/assistants/${slug}`, {
          changeFrequency: 'daily',
          priority: 0.7,
        }),
      ),
      ...this._genSitemap('/discover/plugins', { changeFrequency: 'daily', priority: 0.7 }),
      ...pluginCategory.flatMap((slug) =>
        this._genSitemap(`/discover/plugins/${slug}`, {
          changeFrequency: 'daily',
          priority: 0.7,
        }),
      ),
      ...this._genSitemap('/discover/models', { changeFrequency: 'daily', priority: 0.7 }),
      ...modelCategory.flatMap((slug) =>
        this._genSitemap(`/discover/models/${slug}`, {
          changeFrequency: 'daily',
          priority: 0.7,
        }),
      ),
      ...this._genSitemap('/discover/providers', { changeFrequency: 'daily', priority: 0.7 }),
    ].filter(Boolean);
  }
  getRobots() {
    return [
      getCanonicalUrl('/sitemap-index.xml'),
      ...this.sitemapIndexs.map((index) =>
        getCanonicalUrl(SITEMAP_BASE_URL, isDev ? index.id : `${index.id}.xml`),
      ),
    ];
  }
}

export const sitemapModule = new Sitemap();
