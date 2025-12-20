import { StateCreator } from 'zustand/vanilla';

import { ResouceManagerMode } from '@/features/ResourceManager';
import { FilesTabs } from '@/types/files';

import { State, ViewMode, initialState } from './initialState';

export interface Action {
  /**
   * Set the current file category filter
   */
  setCategory: (category: FilesTabs) => void;
  /**
   * Set the current view item ID
   */
  setCurrentViewItemId: (id?: string) => void;
  /**
   * Set the current library ID
   */
  setLibraryId: (id?: string) => void;
  /**
   * Set the view mode
   */
  setMode: (mode: ResouceManagerMode) => void;
  /**
   * Set selected file IDs
   */
  setSelectedFileIds: (ids: string[]) => void;
  /**
   * Set the file explorer view mode
   */
  setViewMode: (viewMode: ViewMode) => void;
}

export type Store = Action & State;

type CreateStore = (
  initState?: Partial<State>,
) => StateCreator<Store, [['zustand/devtools', never]]>;

export const store: CreateStore = (publicState) => (set) => ({
  ...initialState,
  ...publicState,

  setCategory: (category) => {
    set({ category });
  },

  setCurrentViewItemId: (currentViewItemId) => {
    set({ currentViewItemId });
  },

  setLibraryId: (libraryId) => {
    set({ libraryId });
  },

  setMode: (mode) => {
    set({ mode });
  },

  setSelectedFileIds: (selectedFileIds) => {
    set({ selectedFileIds });
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
  },
});
