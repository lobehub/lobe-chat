import { MetadataRoute } from 'next';

import { sitemapModule } from '@/server/sitemap';
import { getCanonicalUrl } from '@/server/utils/url';

const robots = (): MetadataRoute.Robots => {
  return {
    host: getCanonicalUrl(),
    rules: [
      {
        allow: ['/discover/*'],
        disallow: ['/discover/search/*'],
        userAgent: ['Facebot', 'facebookexternalhit'],
      },
      {
        allow: ['/discover/*'],
        disallow: ['/discover/search/*'],
        userAgent: 'LinkedInBot',
      },
      {
        allow: ['/discover/*'],
        disallow: ['/discover/search/*'],
        userAgent: 'Twitterbot',
      },
      {
        allow: ['/'],
        disallow: ['/api/*', '/login', '/signup', '/files', '/repos/*', '/discover/search/*'],
        userAgent: '*',
      },
    ],
    sitemap: sitemapModule.getRobots(),
  };
};

export default robots;
