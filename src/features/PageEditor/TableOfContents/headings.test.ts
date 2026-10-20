import { describe, expect, it } from 'vitest';

import { collectHeadings, findActiveIndex, findBodyRoot } from './headings';

const render = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

describe('findBodyRoot', () => {
  it('returns the first Lexical root so comment editors are ignored', () => {
    const content = render(
      '<textarea></textarea><div data-lexical-editor id="body"></div><div data-lexical-editor id="comment"></div>',
    );

    expect(findBodyRoot(content)?.id).toBe('body');
  });

  it('returns null without an editor', () => {
    expect(findBodyRoot(render('<p></p>'))).toBeNull();
    expect(findBodyRoot(null)).toBeNull();
  });
});

describe('collectHeadings', () => {
  it('collects h1-h3 in document order and skips empty headings', () => {
    const root = render(
      '<h1>Intro</h1><p>text</p><h2> Setup </h2><h4>Deep</h4><h3></h3><h3>Details</h3>',
    );

    expect(collectHeadings(root).map(({ level, text }) => ({ level, text }))).toEqual([
      { level: 1, text: 'Intro' },
      { level: 2, text: 'Setup' },
      { level: 3, text: 'Details' },
    ]);
  });

  it('returns an empty list without a root', () => {
    expect(collectHeadings(null)).toEqual([]);
  });
});

describe('findActiveIndex', () => {
  it('picks the last heading above the threshold', () => {
    expect(findActiveIndex([-300, -20, 40, 600], 80)).toBe(2);
  });

  it('falls back to the first heading before any is reached', () => {
    expect(findActiveIndex([200, 600], 80)).toBe(0);
  });

  it('returns -1 without headings', () => {
    expect(findActiveIndex([], 80)).toBe(-1);
  });
});
