import qs from 'query-string';

import { htmlToMarkdown } from '../htmlToMarkdown';
import { CrawResult, CrawlImpl } from '../type';

const BASE_URL = process.env.BROWSERLESS_URL ?? 'https://chrome.browserless.io';
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

class BrowserlessInitError extends Error {
  constructor() {
    super('`BROWSERLESS_URL` or `BROWSERLESS_TOKEN` are required');
    this.name = 'BrowserlessInitError';
  }
}

export const browserless: CrawlImpl = async (url) => {
  if (!process.env.BROWSERLESS_URL && !process.env.BROWSERLESS_TOKEN) {
    throw new BrowserlessInitError();
  }

  const input = {
    gotoOptions: { waitUntil: 'networkidle2' },
    url,
  };

  try {
    const res = await fetch(
      qs.stringifyUrl({ query: { token: BROWSERLESS_TOKEN }, url: `${BASE_URL}/content` }),
      {
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    );
    const html = await res.text();

    const result = htmlToMarkdown(html, url);

    // 说明被拦截了
    if (result.title && result.title.trim() === 'Just a moment...') {
      return {
        content: 'fail to craw content due to be blocked',
        errorMessage: result.content,
        url,
      };
    }

    return {
      content: result.content,
      description: result?.excerpt,
      length: result.length,
      siteName: result?.siteName,
      title: result?.title,
      url,
    } satisfies CrawResult;
  } catch (error) {
    console.error(error);
    return { content: '抓取失败', errorMessage: (error as any).message, url };
  }
};
