import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { expect } from 'vitest';

import { htmlToMarkdown } from '../src';

describe('htmlToMarkdown', () => {
  it('Zhihu', () => {
    const html = readFileSync(path.join(__dirname, './html/zhihu.html'), { encoding: 'utf8' });

    const data = htmlToMarkdown(html, 'https://zhuanlan.zhihu.com/p/641434725');

    expect(data).toMatchSnapshot();
  });
});
