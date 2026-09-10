import { describe, expect, it } from 'vitest';

import { BREADCRUMB_ELLIPSIS, toBreadcrumbSegments } from './filePathBreadcrumb';

describe('toBreadcrumbSegments', () => {
  it('anchors on the project root folder name', () => {
    expect(
      toBreadcrumbSegments('/Users/a/work/my-app/src/index.ts', '/Users/a/work/my-app'),
    ).toEqual(['my-app', 'src', 'index.ts']);
  });

  it('collapses the middle of a deep path', () => {
    expect(
      toBreadcrumbSegments(
        '/Users/a/work/my-app/src/features/Portal/LocalFile/Body.tsx',
        '/Users/a/work/my-app',
      ),
    ).toEqual(['my-app', BREADCRUMB_ELLIPSIS, 'LocalFile', 'Body.tsx']);
  });

  it('keeps a path that is not inside the root on its own segments', () => {
    expect(toBreadcrumbSegments('/etc/hosts', '/Users/a/work/my-app')).toEqual(['etc', 'hosts']);
  });

  it('falls back to the full path when no root is given', () => {
    expect(toBreadcrumbSegments('/Users/a/notes.md')).toEqual(['Users', 'a', 'notes.md']);
  });

  it('handles Windows separators', () => {
    expect(toBreadcrumbSegments('C:\\repo\\src\\main.rs', 'C:\\repo')).toEqual([
      'repo',
      'src',
      'main.rs',
    ]);
  });

  it('does not anchor when the file is the root itself', () => {
    expect(toBreadcrumbSegments('/Users/a/work/my-app', '/Users/a/work/my-app')).toEqual([
      'Users',
      'a',
      'work',
      'my-app',
    ]);
  });

  it('returns nothing for an empty path', () => {
    expect(toBreadcrumbSegments('')).toEqual([]);
  });
});
