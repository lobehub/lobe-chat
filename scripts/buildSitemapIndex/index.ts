import dotenv from 'dotenv';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { Sitemap } from '@/server/sitemap';

dotenv.config();

const genSitemap = async () => {
  const sitemapModule = new Sitemap();
  const sitemapIndexXML = await sitemapModule.getIndex();
  const filename = resolve(__dirname, '../../', 'public', 'sitemap-index.xml');
  writeFileSync(filename, sitemapIndexXML);
};

// eslint-disable-next-line unicorn/prefer-top-level-await
genSitemap().catch(console.error);
