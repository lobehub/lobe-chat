import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, it } from 'vitest';

import { remarkVisual } from './remarkPlugin';

const toHast = (markdown: string): any => {
  const processor = unified().use(remarkParse).use(remarkVisual).use(remarkRehype);
  return processor.runSync(processor.parse(markdown));
};

const elements = (tree: any) => (tree.children as any[]).filter((node) => node.type === 'element');

describe('remarkVisual', () => {
  it('turns a visual fence into a lobeVisual element carrying the raw body', () => {
    const tree = toHast('Intro\n\n```visual\n{"type":"stats","items":[]}\n```\n\nAfter');

    expect(elements(tree).map((node) => node.tagName)).toEqual(['p', 'lobeVisual', 'p']);
    expect(elements(tree)[1].children).toEqual([
      { type: 'text', value: '{"type":"stats","items":[]}' },
    ]);
  });

  it('keeps an unclosed fence (still streaming) as a lobeVisual element', () => {
    const [node] = elements(toHast('```visual\n{"type":"st'));

    expect(node.tagName).toBe('lobeVisual');
    expect(node.children[0].value).toBe('{"type":"st');
  });

  it('leaves other code fences alone', () => {
    const [node] = elements(toHast('```json\n{"a":1}\n```'));

    expect(node.tagName).toBe('pre');
  });
});
