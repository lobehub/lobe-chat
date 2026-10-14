import { describe, expect, it } from 'vitest';

import type { ExplorerTreeNode } from '@/features/ExplorerTree';
import type { AgentDocumentSort } from '@/store/global/initialState';

import type { AgentDocumentItem } from '../types';
import { createDocumentComparator } from './sortDocuments';

const node = (
  name: string,
  options: {
    appearance?: 'file';
    createdAt?: string;
    documentUpdatedAt?: string;
    isFolder?: boolean;
    updatedAt?: string;
  } = {},
): ExplorerTreeNode<AgentDocumentItem> => ({
  appearance: options.appearance,
  data: {
    createdAt: new Date(options.createdAt ?? '2026-01-01'),
    documentUpdatedAt: new Date(options.documentUpdatedAt ?? '2026-01-01'),
    updatedAt: new Date(options.updatedAt ?? '2026-01-01'),
  } as AgentDocumentItem,
  id: name,
  isFolder: options.isFolder,
  name,
});

const order = (
  sort: AgentDocumentSort,
  nodes: ExplorerTreeNode<AgentDocumentItem>[],
  locale = 'en-US',
) =>
  nodes
    .slice()
    .sort(createDocumentComparator(sort, locale))
    .map((n) => n.name);

describe('createDocumentComparator', () => {
  it('compares names numerically and case-insensitively, folders first', () => {
    const nodes = [node('Week 10'), node('week 2'), node('Archive', { isFolder: true })];
    expect(order({ by: 'name', foldersFirst: true, order: 'asc' }, nodes)).toEqual([
      'Archive',
      'week 2',
      'Week 10',
    ]);
    expect(order({ by: 'name', foldersFirst: false, order: 'desc' }, nodes)).toEqual([
      'Week 10',
      'week 2',
      'Archive',
    ]);
  });

  it('sorts by time with the name breaking ties', () => {
    const nodes = [
      node('old', { updatedAt: '2026-01-01' }),
      node('b-new', { updatedAt: '2026-03-01' }),
      node('a-new', { updatedAt: '2026-03-01' }),
    ];
    expect(order({ by: 'updatedAt', foldersFirst: true, order: 'desc' }, nodes)).toEqual([
      'a-new',
      'b-new',
      'old',
    ]);
  });

  it('counts a content edit, which only touches the backing document, as an update', () => {
    const nodes = [
      node('renamed', { updatedAt: '2026-02-01' }),
      node('edited', { documentUpdatedAt: '2026-03-01' }),
    ];
    expect(order({ by: 'updatedAt', foldersFirst: true, order: 'desc' }, nodes)).toEqual([
      'edited',
      'renamed',
    ]);
  });

  it('keeps a document holding sub-documents among the files', () => {
    const nodes = [
      node('b', { createdAt: '2026-02-01' }),
      node('a-parent', { appearance: 'file', createdAt: '2026-03-01', isFolder: true }),
      node('z-folder', { createdAt: '2026-01-01', isFolder: true }),
    ];
    expect(order({ by: 'createdAt', foldersFirst: true, order: 'asc' }, nodes)).toEqual([
      'z-folder',
      'b',
      'a-parent',
    ]);
  });
});
