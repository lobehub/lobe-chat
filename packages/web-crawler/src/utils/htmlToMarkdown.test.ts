import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { expect } from 'vitest';

import { htmlToMarkdown } from './htmlToMarkdown';

const list = [
  {
    file: 'terms.html',
    url: 'https://lobehub.com/terms',
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
