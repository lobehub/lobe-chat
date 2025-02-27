import { htmlToMarkdown } from './htmlToMarkdown';

const BASE_URL = process.env.BROWSERLESS_URL ?? 'https://chrome.browserless.io';
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

export const fetchByBrowserless = async ({ url }: { url: string }) => {
  const input = {
    gotoOptions: { waitUntil: 'networkidle2' },
    url,
  };

  try {
    const res = await fetch(`${BASE_URL}/content?token=${BROWSERLESS_TOKEN}`, {
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
    const html = await res.text();

    const article = htmlToMarkdown(html, url);

    return { content: article.content, title: article?.title, url, website: article?.siteName };
  } catch (error) {
    console.error(error);
    return { content: '抓取失败', errorMessage: (error as any).message, url };
  }
};
