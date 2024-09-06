import { glob } from 'glob';

const isVercelPreview = process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production';

const vercelPreviewUrl = `https://${process.env.VERCEL_URL}`;

const siteUrl = isVercelPreview ? vercelPreviewUrl : 'https://lobechat.com';

/** @type {import('next-sitemap').IConfig} */
const config = {
  // next-sitemap does not work with app dir inside the /src dir (and have other problems e.g. with route groups)
  // https://github.com/iamvishnusankar/next-sitemap/issues/700#issuecomment-1759458127
  // https://github.com/iamvishnusankar/next-sitemap/issues/701
  // additionalPaths is a workaround for this (once the issues are fixed, we can remove it)
  additionalPaths: async () => {
    const routes = await glob('src/app/**/page.{md,mdx,ts,tsx}', {
      cwd: new URL('.', import.meta.url).pathname,
    });

    // https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders
    const publicRoutes = routes.filter(
      (page) => !page.split('/').some((folder) => folder.startsWith('_')),
    );

    // https://nextjs.org/docs/app/building-your-application/routing/colocation#route-groups
    const publicRoutesWithoutRouteGroups = publicRoutes.map((page) =>
      page
        .split('/')
        .filter((folder) => !folder.startsWith('(') && !folder.endsWith(')'))
        .join('/'),
    );

    const locs = publicRoutesWithoutRouteGroups.map((route) => {
      const path = route.replace(/^src\/app/, '').replace(/\/[^/]+$/, '');
      const loc = path === '' ? siteUrl : `${siteUrl}/${path}`;

      return loc;
    });

    const paths = locs.map((loc) => ({
      changefreq: 'daily',
      lastmod: new Date().toISOString(),
      loc,
      priority: 0.7,
    }));

    return paths;
  },
  generateRobotsTxt: true,
  siteUrl,
};

export default config;
