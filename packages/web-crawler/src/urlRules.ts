import { CrawlUrlRule } from './type';

export const crawUrlRules: CrawlUrlRule[] = [
  // 搜狗微信链接，使用 search1api
  {
    impls: ['search1api'],
    urlPattern: 'https://weixin.sogou.com/link(.*)',
  },
  // 搜狗链接，使用 search1api
  {
    impls: ['search1api'],
    urlPattern: 'https://sogou.com/link(.*)',
  },
  // YouTube 链接，使用 search1api，格式化 markdown，且可以返回字幕内容
  {
    impls: ['search1api'],
    urlPattern: 'https://www.youtube.com/watch(.*)',
  },
  // Reddit 链接，使用 search1api，格式化 markdown，包含标题、作者、互动数量、具体评论内容等
  {
    impls: ['search1api'],
    urlPattern: 'https://www.reddit.com/r/(.*)/comments/(.*)',
  },
  // 微信公众号有爬虫防护，优先使用 search1api，jina 作为兜底（目前 jina 爬取会被风控）
  {
    impls: ['search1api', 'jina'],
    urlPattern: 'https://mp.weixin.qq.com(.*)',
  },
  // github 源码解析
  {
    filterOptions: {
      enableReadability: false,
    },
    impls: ['naive', 'jina'],
    urlPattern: 'https://github.com/([^/]+)/([^/]+)/blob/([^/]+)/(.*)',
    urlTransform: 'https://github.com/$1/$2/raw/refs/heads/$3/$4',
  },
  {
    filterOptions: {
      enableReadability: false,
    },
    impls: ['naive', 'jina'],
    // GitHub discussion
    urlPattern: 'https://github.com/(.*)/discussions/(.*)',
  },
  // 所有 PDF 都用 jina
  {
    impls: ['jina'],
    urlPattern: 'https://(.*).pdf',
  },
  // arxiv PDF use jina
  {
    impls: ['jina'],
    urlPattern: 'https://arxiv.org/pdf/(.*)',
  },
  // 知乎有爬虫防护，使用 jina
  {
    impls: ['jina'],
    urlPattern: 'https://zhuanlan.zhihu.com(.*)',
  },
  {
    impls: ['jina'],
    urlPattern: 'https://zhihu.com(.*)',
  },
  {
    // Medium 文章转换为 Scribe.rip
    urlPattern: 'https://medium.com/(.*)',
    urlTransform: 'https://scribe.rip/$1',
  },
  {
    filterOptions: {
      enableReadability: false,
    },
    impls: ['jina', 'browserless'],
    urlPattern: 'https://(twitter.com|x.com)/(.*)',
  },
  // 体育数据网站规则
  {
    filterOptions: {
      // 对体育数据表格禁用 Readability 并且转换为纯文本
      enableReadability: false,
      pureText: true,
    },
    impls: ['naive'],
    urlPattern: 'https://www.qiumiwu.com/standings/(.*)',
  },
  // mozilla use jina
  {
    impls: ['jina'],
    urlPattern: 'https://developer.mozilla.org(.*)',
  },
  // cvpr thecvf
  {
    impls: ['jina'],
    urlPattern: 'https://cvpr.thecvf.com(.*)',
  },
  // 飞书用 jina
  // https://github.com/lobehub/lobe-chat/issues/6879
  {
    impls: ['jina'],
    urlPattern: 'https://(.*).feishu.cn/(.*)',
  },
  // 小红书存在爬虫防护，使用 Search1API 或 Jina (备用)
  {
    impls: ['search1api', 'jina'],
    urlPattern: 'https://(.*).xiaohongshu.com/(.*)',
  },
];
