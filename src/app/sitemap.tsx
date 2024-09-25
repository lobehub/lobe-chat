import { MetadataRoute } from 'next';

import { SitemapType, sitemapModule } from '@/server/sitemap';

export const generateSitemaps = async () => {
  // Fetch the total number of products and calculate the number of sitemaps needed
  return sitemapModule.sitemapIndexs;
};

const Sitemap = async ({ id }: { id: SitemapType }): Promise<MetadataRoute.Sitemap> => {
  switch (id) {
    case SitemapType.Pages: {
      return sitemapModule.getPage();
    }
    case SitemapType.Assistants: {
      return sitemapModule.getAssistants();
    }
    case SitemapType.Plugins: {
      return sitemapModule.getPlugins();
    }
    case SitemapType.Models: {
      return sitemapModule.getModels();
    }
    case SitemapType.Providers: {
      return sitemapModule.getProviders();
    }
  }
};

export default Sitemap;
