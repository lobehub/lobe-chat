import { FileListItem } from '@/types/files';

export type ViewMode = 'list' | 'masonry';

export interface FileExplorerState {
  // Pagination state
  currentPage: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  // View state
  isMasonryReady: boolean;

  isTransitioning: boolean;

  // Loaded data
  items: FileListItem[];
  total: number;
  viewMode: ViewMode;
}

export interface FileExplorerActions {
  // Data actions
  appendItems: (items: FileListItem[], hasMore: boolean, total: number) => void;
  loadNextPage: () => Promise<void>;
  resetData: () => void;
  // View actions
  setIsMasonryReady: (ready: boolean) => void;

  setIsTransitioning: (transitioning: boolean) => void;
  setItems: (items: FileListItem[], hasMore: boolean, total: number) => void;
  setViewMode: (mode: ViewMode) => void;
}

export type FileExplorerStore = FileExplorerState & FileExplorerActions;
