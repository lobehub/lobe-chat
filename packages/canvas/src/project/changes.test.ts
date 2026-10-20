import { describe, expect, it } from 'vitest';

import { applyCanvasChanges } from './changes';

const base = new Map([
  ['index.html', { content: '<h1>Old title</h1><p>body</p>', path: 'index.html' }],
  ['data.json', { content: '[1]', path: 'data.json' }],
]);

const textOf = (result: ReturnType<typeof applyCanvasChanges>, path: string) => {
  if (!result.ok) throw new Error(result.error);
  return result.files.find((file) => file.path === path)?.content;
};

describe('applyCanvasChanges', () => {
  it('writes, replaces and deletes files in one change set', () => {
    const result = applyCanvasChanges(base, {
      deletes: ['data.json'],
      edits: [{ newText: 'New title', oldText: 'Old title', path: 'index.html' }],
      writes: [{ content: 'body{}', path: './css/app.css' }],
    });

    expect(result.ok).toBe(true);
    expect(textOf(result, 'index.html')).toBe('<h1>New title</h1><p>body</p>');
    expect(textOf(result, 'css/app.css')).toBe('body{}');
    expect(textOf(result, 'data.json')).toBeUndefined();
  });

  it('decodes base64 writes into bytes', () => {
    const result = applyCanvasChanges(new Map(), {
      writes: [{ content: 'AQID', encoding: 'base64', path: 'a.png' }],
    });

    expect(textOf(result, 'a.png')).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('rejects an edit whose old text is missing or ambiguous', () => {
    expect(
      applyCanvasChanges(base, { edits: [{ newText: 'x', oldText: 'nope', path: 'index.html' }] }),
    ).toMatchObject({ ok: false });
    expect(
      applyCanvasChanges(new Map([['a.html', { content: 'aa', path: 'a.html' }]]), {
        edits: [{ newText: 'b', oldText: 'a', path: 'a.html' }],
      }),
    ).toMatchObject({ error: expect.stringContaining('2 times'), ok: false });
  });

  it('rejects edits and deletes of files that do not exist', () => {
    expect(applyCanvasChanges(base, { deletes: ['nope.css'] })).toMatchObject({ ok: false });
    expect(
      applyCanvasChanges(base, { edits: [{ newText: 'b', oldText: 'a', path: 'nope.html' }] }),
    ).toMatchObject({ ok: false });
  });

  it('rejects edits of binary files', () => {
    const binary = new Map([['a.png', { content: new Uint8Array([1]), path: 'a.png' }]]);
    expect(
      applyCanvasChanges(binary, { edits: [{ newText: 'b', oldText: 'a', path: 'a.png' }] }),
    ).toMatchObject({ ok: false });
  });
});
