import { create } from 'zustand';

interface EntityViewState {
  back: () => void;
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
  history: [],
  open: (id) =>
    set((s) => ({
      history: s.selectedId && s.selectedId !== id ? [...s.history, s.selectedId] : s.history,
      selectedId: id,
    })),
  select: (id) => set({ history: [], selectedId: id }),
  selectedId: undefined,
}));
