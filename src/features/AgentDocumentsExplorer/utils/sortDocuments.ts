import type { ExplorerTreeNode, ExplorerTreeNodeComparator } from '@/features/ExplorerTree';
import type { AgentDocumentSort } from '@/store/global/initialState';

import type { AgentDocumentItem } from '../types';

type DocumentNode = ExplorerTreeNode<AgentDocumentItem>;

// Dates arrive as Date over superjson; tolerate a serialized string too.
const toTime = (value: Date | string | null | undefined): number =>
  value ? new Date(value).getTime() || 0 : 0;

const timeOf = (node: DocumentNode, by: 'createdAt' | 'updatedAt'): number => {
  const doc = node.data;
  if (!doc) return 0;
  if (by === 'createdAt') return toTime(doc.createdAt);
  // A rename or move touches the binding; a content edit only the document.
  return Math.max(toTime(doc.documentUpdatedAt), toTime(doc.updatedAt));
};

// A document holding sub-documents is a tree container drawn as a file; it
// sorts with the files, not the folders.
const isFolderRow = (node: DocumentNode) => !!node.isFolder && node.appearance !== 'file';

/**
 * Orders document tree siblings. Names compare the way people read them
 * (locale-aware, `2` before `10`); time sorts fall back to the name on ties.
 */
export const createDocumentComparator = (
  sort: AgentDocumentSort,
  locale?: string,
): ExplorerTreeNodeComparator<AgentDocumentItem> => {
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  const direction = sort.order === 'asc' ? 1 : -1;

  return (a, b) => {
    if (sort.foldersFirst) {
      const aFolder = isFolderRow(a);
      if (aFolder !== isFolderRow(b)) return aFolder ? -1 : 1;
    }
    const byName = collator.compare(a.name, b.name);
    const field = sort.by;
    if (field === 'name') return byName * direction;
    const byTime = timeOf(a, field) - timeOf(b, field);
    return byTime * direction || byName;
  };
};
