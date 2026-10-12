import type { ProjectFileIndexResult } from '@lobechat/electron-client-ipc';
import { describe, expect, it } from 'vitest';

import {
  decodeProjectIndex,
  encodeProjectIndex,
  GIT_WORKING_TREE_PERSIST_MAX_PATHS,
  gitWorkingTreeFilesCodec,
  projectIndexCodec,
} from './projectFile';

const index: ProjectFileIndexResult = {
  entries: [
    { isDirectory: true, name: 'src', path: '/repo/src', relativePath: 'src/' },
    {
      isDirectory: false,
      name: 'index.ts',
      path: '/repo/src/index.ts',
      relativePath: 'src/index.ts',
    },
    {
      collapsed: true,
      gitIgnored: true,
      isDirectory: true,
      name: 'node_modules',
      path: '/repo/node_modules',
      relativePath: 'node_modules/',
    },
    {
      gitIgnored: true,
      isDirectory: false,
      name: '.env',
      path: '/repo/.env',
      relativePath: '.env',
    },
  ],
  indexedAt: '2026-10-12T00:00:00.000Z',
  root: '/repo',
  source: 'git',
};

describe('project index codec', () => {
  it('round-trips an index losslessly while dropping derivable fields', () => {
    const encoded = encodeProjectIndex(index);

    expect(encoded.entries).toEqual([
      ['src/', 1],
      ['src/index.ts', 0],
      ['node_modules/', 7],
      ['.env', 2],
    ]);
    expect(decodeProjectIndex(encoded)).toEqual(index);
  });

  it('keeps paths and names a host did not derive from the root', () => {
    const windows: ProjectFileIndexResult = {
      entries: [
        { isDirectory: true, name: 'src', path: 'C:\\repo\\src', relativePath: 'src/' },
        { isDirectory: false, name: 'a.ts', path: 'C:\\repo\\src\\a.ts', relativePath: 'src/a.ts' },
      ],
      indexedAt: 'now',
      root: 'C:\\repo',
      source: 'glob',
    };
    const sandbox: ProjectFileIndexResult = {
      entries: [
        {
          isDirectory: false,
          name: 'Report',
          path: '/workspace/out/report.md',
          relativePath: 'report.md',
        },
      ],
      indexedAt: 'now',
      root: '',
      source: 'sandbox',
      truncated: true,
    };

    expect(encodeProjectIndex(windows).entries).toEqual([
      ['src/', 1],
      ['src/a.ts', 0],
    ]);
    expect(decodeProjectIndex(encodeProjectIndex(windows))).toEqual(windows);
    expect(decodeProjectIndex(encodeProjectIndex(sandbox))).toEqual(sandbox);
  });

  it('keeps the shallowest entries, in order, when the tree is past the cap', () => {
    const decoded = decodeProjectIndex(encodeProjectIndex(index, 3));

    expect(decoded.entries.map((entry) => entry.relativePath)).toEqual([
      'src/',
      'node_modules/',
      '.env',
    ]);
  });

  it('persists only settled data and restores it as SWR state', () => {
    expect(projectIndexCodec.encode({ isLoading: true })).toBeUndefined();

    const row = projectIndexCodec.encode({
      data: index,
      error: undefined,
      isLoading: false,
      isValidating: true,
    });
    expect(row).not.toHaveProperty('isValidating');
    expect(projectIndexCodec.decode(row)).toEqual({ data: index });
    expect(projectIndexCodec.decode({ data: index })).toBeUndefined();
  });
});

describe('git working tree codec', () => {
  it('stores the dirty-file lists and skips oversized overlays', () => {
    const files = { added: ['a.ts'], deleted: [], modified: ['b.ts'] };
    expect(
      gitWorkingTreeFilesCodec.decode(gitWorkingTreeFilesCodec.encode({ data: files })),
    ).toEqual({ data: files });

    const huge = {
      added: Array.from({ length: GIT_WORKING_TREE_PERSIST_MAX_PATHS + 1 }, (_, i) => `f${i}`),
      deleted: [],
      modified: [],
    };
    expect(gitWorkingTreeFilesCodec.encode({ data: huge })).toBeUndefined();
  });
});
