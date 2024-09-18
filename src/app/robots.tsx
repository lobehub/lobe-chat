import { MetadataRoute } from 'next';

import { sitemapModule } from '@/server/sitemap';
import { getCanonicalUrl } from '@/server/utils/url';

export default function robots(): MetadataRoute.Robots {
  return {
    host: getCanonicalUrl(),
    rules: {
      allow: ['/'],
      disallow: ['/api/*'],
      userAgent: '*',
    },
    sitemap: sitemapModule.getRobots(),
  };
}
