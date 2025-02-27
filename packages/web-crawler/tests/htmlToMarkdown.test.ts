import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { expect } from 'vitest';

import { htmlToMarkdown } from '../src';

const list = [
  {
    file: 'zhihu.html',
    url: 'https://zhuanlan.zhihu.com/p/641434725',
  },
  { file: 'yingchao.html', url: 'https://www.qiumiwu.com/standings/yingchao' },
];

describe('htmlToMarkdown', () => {
  list.forEach((item) => {
    it(`should transform ${item.file} to markdown`, () => {
      const html = readFileSync(path.join(__dirname, `./html/${item.file}`), { encoding: 'utf8' });

      const data = htmlToMarkdown(html, item.url);

      expect(data).toMatchSnapshot();
    });
  });
});
