import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

import { FilterOptions } from '../type';
import { htmlToMarkdown } from './htmlToMarkdown';

interface TestItem {
  file: string;
  url: string;
  filterOptions?: FilterOptions;
}

const list: TestItem[] = [
  {
    file: 'terms.html',
    url: 'https://lobehub.com/terms',
  },
  {
    file: 'yingchao.html',
    url: 'https://www.qiumiwu.com/standings/yingchao',
    filterOptions: { pureText: true, enableReadability: false },
  },
];

describe('htmlToMarkdown', () => {
  list.forEach((item) => {
    it(`should transform ${item.file} to markdown`, () => {
      const html = readFileSync(path.join(__dirname, `./html/${item.file}`), { encoding: 'utf8' });

      const data = htmlToMarkdown(html, { url: item.url, filterOptions: item.filterOptions || {} });

      expect(data).toMatchSnapshot();
    });
  });

  it('should handle empty HTML', () => {
    const data = htmlToMarkdown('', { url: 'https://example.com', filterOptions: {} });
    expect(data).toEqual({ content: '' });
  });

  it('should handle HTML without readability content', () => {
    const html = '<p>Test content</p>';
    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: { enableReadability: true },
    });
    expect(data).toMatchObject({
      content: 'Test content',
      description: 'Test content',
      length: 12,
      title: '',
    });
  });

  it('should remove null values from result', () => {
    const html = '<p>Test content</p>';
    const data = htmlToMarkdown(html, { url: 'https://example.com', filterOptions: {} });
    expect(Object.values(data).every((v) => v !== null)).toBe(true);
  });

  it('should handle pure text mode', () => {
    const html = '<p>Test <a href="#">link</a> <img src="test.jpg" alt="test"></p>';
    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: { pureText: true },
    });
    expect(data.content).not.toContain('![');
    expect(data.content).not.toContain('](');
  });

  it('should preserve links in normal mode', () => {
    const html = '<p>Test <a href="#">link</a></p>';
    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: { pureText: false },
    });
    expect(data.content).toContain('](');
  });

  it('should handle article metadata', () => {
    const html = `
      <html>
        <head>
          <title>Test Title</title>
          <meta name="description" content="Test Description">
        </head>
        <body>
          <article>
            <h1>Test Article</h1>
            <p>Test content</p>
          </article>
        </body>
      </html>
    `;

    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: { enableReadability: true },
    });

    expect(data).toMatchObject({
      content: expect.any(String),
      title: expect.any(String),
      description: expect.any(String),
      length: expect.any(Number),
    });
  });
});
