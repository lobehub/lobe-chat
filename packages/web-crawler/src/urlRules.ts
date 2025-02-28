import { CrawlUrlRule } from './type';

export const crawUrlRules: CrawlUrlRule[] = [
  {
    filterOptions: {
      enableReadability: false,
    },
    urlPattern: 'https://github.com/*/*/blob/**',
    urlTransform: 'https://github.com/$1/$2/raw/refs/heads/$3/$4',
  },
  {
    urlPattern: 'https://medium.com/**',
    urlTransform: 'https://scribe.rip/**',
  },
  // 体育数据网站规则
  {
    filterOptions: {
      enableReadability: false, // 对体育数据表格禁用Readability
      keepTables: true,
    },
    urlPattern: 'https://www.qiumiwu.com/standings/**',
  },
];
