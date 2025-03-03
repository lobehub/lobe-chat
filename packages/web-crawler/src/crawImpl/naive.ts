import { CrawlImpl, CrawlSuccessResult } from '../type';
import { NetworkConnectionError, PageNotFoundError } from '../utils/errorType';
import { htmlToMarkdown } from '../utils/htmlToMarkdown';

const mixinHeaders = {
  // 接受的内容类型
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  // 接受的编码方式
  'Accept-Encoding': 'gzip, deflate, br',
  // 接受的语言
  'Accept-Language': 'en-US,en;q=0.9,zh;q=0.8',
  // 缓存控制
  'Cache-Control': 'max-age=0',
  // 连接类型
  'Connection': 'keep-alive',
  // 表明请求来自哪个站点
  'Referer': 'https://www.google.com/',
  // 升级不安全请求
  'Upgrade-Insecure-Requests': '1',
  // 模拟真实浏览器的 User-Agent
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  // 防止跨站请求伪造
  'sec-ch-ua': '"Google Chrome";v="121", "Not A(Brand";v="99", "Chromium";v="121"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
};

export const naive: CrawlImpl = async (url, { filterOptions }) => {
  let res: Response;

  try {
    res = await fetch(url, { headers: mixinHeaders });
  } catch (e) {
    if ((e as Error).message === 'fetch failed') {
      throw new NetworkConnectionError();
    }
    throw e;
  }

  if (res.status === 404) {
    throw new PageNotFoundError(res.statusText);
  }
  const type = res.headers.get('content-type');

  if (type?.includes('application/json')) {
    const json = await res.json();
    return {
      content: JSON.stringify(json, null, 2),
      contentType: 'json',
      length: json.length,
      url,
    } satisfies CrawlSuccessResult;
  }

  try {
    const html = await res.text();

    const result = htmlToMarkdown(html, { filterOptions, url });

    // if the content is not empty or blocked
    // just return
    if (!!result.content && result.title !== 'Just a moment...') {
      return {
        content: result.content,
        contentType: 'text',
        description: result?.excerpt,
        length: result.length,
        siteName: result?.siteName,
        title: result?.title,
        url,
      } satisfies CrawlSuccessResult;
    }
  } catch (error) {
    console.error(error);
  }

  return;
};
