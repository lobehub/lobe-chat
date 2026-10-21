import { CANVAS_CODE_LANGUAGES } from '@lobechat/canvas';
import { describe, expect, it } from 'vitest';

import { CODE_GRAMMARS, highlightCode } from './highlight';

describe('highlight add-on', () => {
  it('bundles a grammar for every language the component reference promises', () => {
    expect(Object.keys(CODE_GRAMMARS).sort()).toEqual([...CANVAS_CODE_LANGUAGES].sort());
  });

  it('colors code with theme variables and accepts common aliases', async () => {
    const html = await highlightCode('const ids: string[] = [];', 'ts');

    expect(html).toContain('const');
    expect(html).toMatch(/style="color:\s?var\(--lobe-/);
    expect(await highlightCode('echo hi', 'sh')).toMatch(/style="color:\s?var\(--lobe-/);
  });

  it('shows an unknown language as escaped plain text', async () => {
    const html = await highlightCode('a < b', 'brainfudge');

    expect(html).toContain('a &#x3C; b');
    expect(html).not.toMatch(/<span style="color:\s?var\(--lobe-color-success/);
  });
});
