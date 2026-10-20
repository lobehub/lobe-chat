import { afterEach, describe, expect, it } from 'vitest';

import { captureStyles, diffStyleSnapshots } from './snapshot';

const mount = (html: string) => {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  return root;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('captureStyles', () => {
  it('keys elements by their path under the root and labels them by tag and text', () => {
    const root = mount('<section><span>Hello world</span></section><p>Bye</p>');
    const keys = captureStyles(root).map(({ key, label }) => [key, label]);

    expect(keys).toEqual([
      ['0', 'SECTION:Hello world'],
      ['0.0', 'SPAN:Hello world'],
      ['1', 'P:Bye'],
    ]);
  });

  it('skips subtrees that are not rendered', () => {
    const root = mount('<div style="display: none"><span>hidden</span></div><p>shown</p>');

    expect(captureStyles(root).map(({ label }) => label)).toEqual(['P:shown']);
  });
});

describe('diffStyleSnapshots', () => {
  it('reports changed properties and boxes per element', () => {
    const root = mount('<div style="color: red; width: 10px">a</div>');
    const before = captureStyles(root);
    (root.firstElementChild as HTMLElement).style.color = 'blue';
    const after = captureStyles(root);

    expect(diffStyleSnapshots(before, after)).toEqual([
      { changed: { color: ['red', 'blue'] }, key: '0', label: 'DIV:a' },
    ]);
  });

  it('reports elements that only exist on one side', () => {
    const before = captureStyles(mount('<p>a</p>'));
    document.body.innerHTML = '';
    const after = captureStyles(mount('<p>a</p><b>b</b>'));

    expect(diffStyleSnapshots(before, after)).toEqual([{ added: true, key: '1', label: 'B:b' }]);
    expect(diffStyleSnapshots(after, before)).toEqual([{ key: '1', label: 'B:b', removed: true }]);
  });

  it('returns nothing for identical snapshots', () => {
    const root = mount('<div style="padding: 4px"><span>x</span></div>');

    expect(diffStyleSnapshots(captureStyles(root), captureStyles(root))).toEqual([]);
  });
});
