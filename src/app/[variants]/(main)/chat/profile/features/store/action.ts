import { StateCreator } from 'zustand';

import { State, initialState } from './initialState';

export interface Action {
  setChatPanelExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
}

export type Store = State & Action;

export const store: (initState?: Partial<State>) => StateCreator<Store> = (initState) => (set) => ({
  ...initialState,
  ...initState,

  setChatPanelExpanded: (expanded) => {
    if (typeof expanded === 'function') {
      set((state) => ({ chatPanelExpanded: expanded(state.chatPanelExpanded) }));
    } else {
      set({ chatPanelExpanded: expanded });
    }
  },
});
