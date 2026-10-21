import { describe, expect, it } from 'vitest';

import { applyHtmlEdit, HtmlEditError } from './html';

const HTML = '<h1>Report</h1><p class="n">12</p><p class="n">12</p>';

describe('applyHtmlEdit', () => {
  it('replaces a unique exact match', () => {
    expect(
      applyHtmlEdit(HTML, { newString: '<h1>Report v2</h1>', oldString: '<h1>Report</h1>' }),
    ).toEqual({
      html: '<h1>Report v2</h1><p class="n">12</p><p class="n">12</p>',
      replacementCount: 1,
    });
  });

  it('keeps `$` sequences in the new text literal', () => {
    expect(
      applyHtmlEdit('<p>x</p>', { newString: '<p>$& $1</p>', oldString: '<p>x</p>' }).html,
    ).toBe('<p>$& $1</p>');
  });

  it('rejects an ambiguous match unless replaceAll is set', () => {
    const edit = { newString: '<p class="n">13</p>', oldString: '<p class="n">12</p>' };

    expect(() => applyHtmlEdit(HTML, edit)).toThrow(/occurs 2 times/);
    expect(applyHtmlEdit(HTML, { ...edit, replaceAll: true })).toEqual({
      html: '<h1>Report</h1><p class="n">13</p><p class="n">13</p>',
      replacementCount: 2,
    });
  });

  it('rejects a missing, empty or no-op edit', () => {
    expect(() => applyHtmlEdit(HTML, { newString: 'a', oldString: '<h2>' })).toThrow(HtmlEditError);
    expect(() => applyHtmlEdit(HTML, { newString: 'a', oldString: '' })).toThrow(/empty/);
    expect(() => applyHtmlEdit(HTML, { newString: '<h1>', oldString: '<h1>' })).toThrow(
      /identical/,
    );
  });
});
