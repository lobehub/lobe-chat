import { StateCreator } from 'zustand/vanilla';

import { ResouceManagerMode } from '@/features/ResourceManager';

import { State, initialState } from './initialState';

export interface Action {
  /**
   * Set the current view item ID
   */
  setCurrentViewItemId: (id?: string) => void;
  /**
   * Set the view mode
   */
  setMode: (mode: ResouceManagerMode) => void;
}

export type Store = Action & State;

type CreateStore = (
  initState?: Partial<State>,
) => StateCreator<Store, [['zustand/devtools', never]]>;

export const store: CreateStore = (publicState) => (set) => ({
  ...initialState,
  ...publicState,

  setCurrentViewItemId: (currentViewItemId) => {
    set({ currentViewItemId });
  },

  setMode: (mode) => {
    set({ mode });
  },
});
