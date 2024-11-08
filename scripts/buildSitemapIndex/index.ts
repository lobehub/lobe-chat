import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { sitemapModule } from '@/server/sitemap';

const genSitemap = () => {
  const sitemapIndexXML = sitemapModule.getIndex();
  const filename = resolve(__dirname, '../../', 'public', 'sitemap-index.xml');
  writeFileSync(filename, sitemapIndexXML);
};

genSitemap();
