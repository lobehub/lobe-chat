import { afterEach, describe, expect, it } from 'vitest';

import { createStyleSnapshotApi } from '.';

afterEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('createStyleSnapshotApi', () => {
  it('compares the current page against a snapshot saved before a reload', () => {
    document.body.innerHTML = '<main><p style="color: red">a</p></main><aside>noise</aside>';
    expect(createStyleSnapshotApi().capture('list', 'main')).toBe(1);

    document.body.innerHTML = '<main><p style="color: blue">a</p></main>';
    expect(createStyleSnapshotApi().compare('list')).toEqual([
      { changed: { color: ['red', 'blue'] }, key: '0', label: 'P:a' },
    ]);
  });

  it('clears only its own entries', () => {
    localStorage.setItem('other', '1');
    document.body.innerHTML = '<main></main>';
    const api = createStyleSnapshotApi();
    api.capture('list', 'main');
    api.clear();

    expect(() => api.compare('list')).toThrow('no snapshot named list');
    expect(localStorage.getItem('other')).toBe('1');
  });

  it('names the selector that matched nothing', () => {
    expect(() => createStyleSnapshotApi().capture('x', '#missing')).toThrow('#missing');
  });
});
