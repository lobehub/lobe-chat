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

  it('should strip HTML when pureText is true', () => {
    const html = '<p>Text <a href="#">with link</a> and <img src="test.jpg" alt="image"/></p>';
    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: { pureText: true },
    });
    expect(data).toMatchObject({
      content: 'Text with link and ',
      description: 'Text with link and',
      length: 19,
      title: '',
    });
  });

  it('should preserve metadata when available', () => {
    const html = `
      <html>
        <head>
          <title>Test Title</title>
          <meta name="description" content="Test Description">
        </head>
        <body>
          <article>
            <h1>Article Title</h1>
            <p>Article content</p>
            <meta name="author" content="Test Author">
          </article>
        </body>
      </html>
    `;

    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: { enableReadability: true },
    });

    expect(data.title).toBeDefined();
    expect(data.content).toContain('Article content');
    expect(data.description).toBeDefined();
    expect(data.length).toBeGreaterThan(0);
  });

  it('should handle readability disabled', () => {
    const html = '<p>Original content</p>';
    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: { enableReadability: false },
    });
    expect(data).toMatchObject({
      content: 'Original content',
      description: 'Original content',
      length: 16,
      title: '',
    });
  });

  it('should clean null values from output', () => {
    const html = '<p>Test</p>';
    const data = htmlToMarkdown(html, {
      url: 'https://example.com',
      filterOptions: {},
    });

    expect(data).not.toHaveProperty('author');
    expect(data).not.toHaveProperty('publishedTime');
    expect(data).not.toHaveProperty('siteName');
    expect(data).toHaveProperty('content');
  });
});
