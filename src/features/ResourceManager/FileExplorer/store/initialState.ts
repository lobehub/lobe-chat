import { FileExplorerState } from './types';

export const initialFileExplorerState: FileExplorerState = {
  // Pagination state
  currentPage: 0,
  hasMore: false,
  isLoadingMore: false,

  // View state
  isMasonryReady: false,

  isTransitioning: false,

  // Loaded data
  items: [],
  total: 0,
  viewMode: 'list',
};
