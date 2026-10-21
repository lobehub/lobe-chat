import { create } from 'zustand';

interface EntityViewState {
  back: () => void;
  /**
   * Keeps the page on screen when it was only shown as the default pick: changing its status
   * would otherwise make another context the default and swap the page mid-action.
   */
  ensureSelected: (id: string) => void;
  /** Pages visited by following links, so the header can offer a way back. */
  history: string[];
  /** Follows a link from the current page; keeps the way back. */
  open: (id: string) => void;
  /** Picks a page from the list; starts a fresh trail. */
  select: (id?: string) => void;
  selectedId?: string;
}

/** View state only; the data itself comes from `useEntityData`. */
export const useEntityViewStore = create<EntityViewState>()((set, get) => ({
  back: () => {
    const history = get().history;
    if (history.length === 0) return;
    set({ history: history.slice(0, -1), selectedId: history.at(-1) });
  },
  ensureSelected: (id) => {
    if (!get().selectedId) set({ selectedId: id });
  },
  history: [],
  open: (id) =>
    set((s) => ({
      history: s.selectedId && s.selectedId !== id ? [...s.history, s.selectedId] : s.history,
      selectedId: id,
    })),
  select: (id) => set({ history: [], selectedId: id }),
  selectedId: undefined,
}));
