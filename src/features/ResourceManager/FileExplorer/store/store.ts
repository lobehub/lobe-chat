import { StateCreator } from 'zustand/vanilla';

import { initialFileExplorerState } from './initialState';
import { FileExplorerStore } from './types';

const createStore: StateCreator<FileExplorerStore, [['zustand/devtools', never]]> = (set) => ({
  ...initialFileExplorerState,

  appendItems: (items, hasMore, total) => {
    set((state) => ({
      currentPage: state.currentPage + 1,
      hasMore,
      items: [...state.items, ...items],
      total,
    }));
  },

  loadNextPage: async () => {
    // This will be implemented in the hook that uses the store
    // The hook will handle the actual data fetching
  },

  resetData: () => {
    set({
      currentPage: 0,
      hasMore: false,
      isLoadingMore: false,
      items: [],
      total: 0,
    });
  },

  setIsMasonryReady: (ready) => {
    set({ isMasonryReady: ready });
  },

  setIsTransitioning: (transitioning) => {
    set({ isTransitioning: transitioning });
  },

  // Data actions
  setItems: (items, hasMore, total) => {
    set({
      currentPage: 1,
      hasMore,
      items,
      total,
    });
  },

  // View actions
  setViewMode: (mode) => {
    set({
      isTransitioning: true,
      viewMode: mode,
    });
    if (mode === 'masonry') {
      set({ isMasonryReady: false });
    }
  },
});

export const createFileExplorerStore = (): StateCreator<
  FileExplorerStore,
  [['zustand/devtools', never]]
> => createStore;
