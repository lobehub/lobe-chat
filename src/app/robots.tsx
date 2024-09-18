import { MetadataRoute } from 'next';

import { OFFICIAL_URL } from '@/const/url';
import { sitemapModule } from '@/server/sitemap';

export default function robots(): MetadataRoute.Robots {
  return {
    host: OFFICIAL_URL,
    rules: {
      allow: ['/'],
      disallow: ['/api/*'],
      userAgent: '*',
    },
    sitemap: sitemapModule.getRobots(),
  };
}
