import { describe, expect, it } from 'vitest';

import { alignLiteXMLBlocks } from '../alignLiteXMLBlocks';
import { diffLiteXMLBlocks } from '../liteXMLBlockDiff';

const page = (...blocks: string[]) => `<root>${blocks.join('')}</root>`;

const current = page(
  '<p id="a1"><span id="s1">one</span></p>',
  '<p id="a2"><span id="s2">two</span></p>',
  '<p id="a3"><span id="s3">three</span></p>',
);

describe('alignLiteXMLBlocks', () => {
  it('keeps blocks that read the same, whatever ids the rewrite carries', () => {
    const rewrite = page(
      '<p id="x1"><span id="y1">one</span></p>',
      '<p id="x2"><span id="y2">two</span></p>',
      '<p id="x3"><span id="y3">three</span></p>',
    );

    const aligned = alignLiteXMLBlocks(current, rewrite)!;
    const diff = diffLiteXMLBlocks(current, aligned);

    expect(diff.ok && diff.operations).toEqual([]);
  });

  it('turns a changed block into a modify of the block it replaces', () => {
    const rewrite = page(
      '<p id="x1"><span id="y1">one</span></p>',
      '<p id="x2"><span id="y2">TWO</span></p>',
      '<p id="x3"><span id="y3">three</span></p>',
    );

    const diff = diffLiteXMLBlocks(current, alignLiteXMLBlocks(current, rewrite)!);

    expect(diff.ok && diff.summary).toEqual({ inserted: 0, modified: 1, removed: 0 });
    expect(diff.ok && diff.operations[0]).toMatchObject({ action: 'modify' });
    expect(diff.ok && (diff.operations[0] as any).litexml).toContain('id="a2"');
  });

  it('inserts new blocks and removes dropped ones', () => {
    const rewrite = page(
      '<p id="x1"><span id="y1">one</span></p>',
      '<h2 id="x9"><span id="y9">new heading</span></h2>',
      '<p id="x3"><span id="y3">three</span></p>',
      '<p id="x4"><span id="y4">four</span></p>',
    );

    const diff = diffLiteXMLBlocks(current, alignLiteXMLBlocks(current, rewrite)!);

    expect(diff.ok && diff.summary).toEqual({ inserted: 2, modified: 0, removed: 1 });
  });

  it('rejects invalid LiteXML', () => {
    expect(alignLiteXMLBlocks(current, '<root><p>broken')).toBeUndefined();
  });
});
