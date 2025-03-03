import qs from 'query-string';

import { CrawlImpl, CrawlSuccessResult } from '../type';
import { htmlToMarkdown } from '../utils/htmlToMarkdown';

const BASE_URL = process.env.BROWSERLESS_URL ?? 'https://chrome.browserless.io';
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

class BrowserlessInitError extends Error {
  constructor() {
    super('`BROWSERLESS_URL` or `BROWSERLESS_TOKEN` are required');
    this.name = 'BrowserlessInitError';
  }
}

export const browserless: CrawlImpl = async (url, { filterOptions }) => {
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

    const result = htmlToMarkdown(html, { filterOptions, url });

    if (
      !!result.content &&
      result.title &&
      // Just a moment... 说明被 CF 拦截了
      result.title.trim() !== 'Just a moment...'
    ) {
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
