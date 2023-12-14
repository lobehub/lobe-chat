import { globSync } from 'glob';
import { resolve } from 'node:path';

export const WIKI_URL = 'https://github.com/lobehub/lobe-chat/wiki/';
export const ROOT = resolve(__dirname, '../..');
export const DOCS_DIR = resolve(ROOT, 'docs');
export const HOME_PATH = resolve(DOCS_DIR, 'Home.md');
export const SIDEBAR_PATH = resolve(DOCS_DIR, '_Sidebar.md');
export const docsFiles = globSync(resolve(DOCS_DIR, '**/*.md'), {
  ignore: ['Home.md', '_Sidebar.md', '_Footer.md'],
  nodir: true,
}).filter((file) => !file.includes('.zh-CN.md'));

export const SPLIT = '<!-- DOCS LIST -->';
