import { FileExplorerStore } from './types';

export const fileExplorerSelectors = {
  currentPage: (s: FileExplorerStore) => s.currentPage,

  hasMore: (s: FileExplorerStore) => s.hasMore,

  isLoadingMore: (s: FileExplorerStore) => s.isLoadingMore,

  isMasonryReady: (s: FileExplorerStore) => s.isMasonryReady,

  isTransitioning: (s: FileExplorerStore) => s.isTransitioning,

  // Data selectors
  items: (s: FileExplorerStore) => s.items,

  total: (s: FileExplorerStore) => s.total,
  // View selectors
  viewMode: (s: FileExplorerStore) => s.viewMode,
};
