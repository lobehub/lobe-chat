import { PluginRunner } from '@/plugins/type';

import { Result } from './type';

const BASE_URL = process.env.BROWSERLESS_URL ?? 'https://chrome.browserless.io';
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

// service from: https://github.com/lobehub/html-parser/tree/master
const HTML_PARSER_URL = process.env.HTML_PARSER_URL;

const runner: PluginRunner<{ url: string }, Result> = async ({ url }) => {
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

    const parserBody = { html, url };

    const parseRes = await fetch(`${HTML_PARSER_URL}`, {
      body: JSON.stringify(parserBody),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    return await parseRes.json();
  } catch (error) {
    console.error(error);
    return { content: '抓取失败', errorMessage: (error as any).message };
  }
};

export default runner;
