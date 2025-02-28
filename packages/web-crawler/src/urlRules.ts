import { CrawlUrlRule } from './type';

export const crawUrlRules: CrawlUrlRule[] = [
  {
    filterOptions: {
      enableReadability: false,
    },
    urlPattern: 'https://github.com/([^/]+)/([^/]+)/blob/([^/]+)/(.*)',
    urlTransform: 'https://github.com/$1/$2/raw/refs/heads/$3/$4',
  },
  {
    // Medium 文章转换为 Scribe.rip
    urlPattern: 'https://medium.com/(.*)',
    urlTransform: 'https://scribe.rip/$1',
  },

  // 体育数据网站规则
  {
    filterOptions: {
      enableReadability: false, // 对体育数据表格禁用 Readability
      keepTables: true,
    },
    urlPattern: 'https://www.qiumiwu.com/standings/(.*)',
  },
];
