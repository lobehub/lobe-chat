import { create } from 'zustand';

import { mockActivities, mockEntities, mockMergeSuggestions } from './mock';
import {
  type DemoState,
  type EntityStatus,
  type MemoryActivity,
  type MemoryEntity,
  type MergeSuggestion,
} from './types';

interface Snapshot {
  activities: MemoryActivity[];
  deletedIds: string[];
  entities: MemoryEntity[];
  suggestions: MergeSuggestion[];
}

interface EntityDemoState extends Snapshot {
  demoState: DemoState;
  /** Pages visited by following links, so the header can offer a way back. */
  history: string[];
  selectedId?: string;
}

interface EntityDemoActions {
  back: () => void;
  dismissSuggestion: (fromId: string) => void;
  /** Folds `fromId` into `intoId`: aliases move over and every timeline link is rewritten. */
  merge: (fromId: string, intoId: string) => Snapshot;
  /** Follows a link from the current page; keeps the way back. */
  open: (id: string) => void;
  remove: (id: string) => Snapshot;
  restore: (id: string) => void;
  restoreSnapshot: (snapshot: Snapshot) => void;
  /** Picks a page from the list; starts a fresh trail. */
  select: (id?: string) => void;
  setDemoState: (state: DemoState) => void;
  setStatus: (id: string, status: EntityStatus) => void;
  updateNow: (id: string, now: string) => void;
}

const takeSnapshot = (s: Snapshot): Snapshot => ({
  activities: s.activities,
  deletedIds: s.deletedIds,
  entities: s.entities,
  suggestions: s.suggestions,
});

const dedupe = <T>(items: T[]) => [...new Set(items)];

export const useEntityDemoStore = create<EntityDemoState & EntityDemoActions>()((set, get) => ({
  activities: mockActivities,
  back: () => {
    const history = get().history;
    if (history.length === 0) return;
    set({ history: history.slice(0, -1), selectedId: history.at(-1) });
  },
  deletedIds: [],
  demoState: 'ready',
  dismissSuggestion: (fromId) =>
    set((s) => ({ suggestions: s.suggestions.filter((item) => item.fromId !== fromId) })),
  entities: mockEntities,
  history: [],
  merge: (fromId, intoId) => {
    const snapshot = takeSnapshot(get());
    const from = snapshot.entities.find((e) => e.id === fromId);
    const into = snapshot.entities.find((e) => e.id === intoId);
    if (!from || !into) return snapshot;

    set((s) => ({
      activities: s.activities.map((activity) => {
        if (!activity.links.some((link) => link.id === fromId)) return activity;
        const links = activity.links.map((link) =>
          link.id === fromId ? { id: intoId, kind: into.kind } : link,
        );
        // An entry that linked both pages now links the survivor once.
        return {
          ...activity,
          links: links.filter((l, i) => links.findIndex((x) => x.id === l.id) === i),
        };
      }),
      entities: s.entities
        .filter((e) => e.id !== fromId)
        .map((e) =>
          e.id === intoId ? { ...e, aliases: dedupe([...e.aliases, from.title, ...from.aliases]) } : e,
        ),
      history: s.history.filter((id) => id !== fromId),
      selectedId: intoId,
      suggestions: s.suggestions.filter((item) => item.fromId !== fromId && item.intoId !== fromId),
    }));
    return snapshot;
  },
  open: (id) =>
    set((s) => ({
      history: s.selectedId && s.selectedId !== id ? [...s.history, s.selectedId] : s.history,
      selectedId: id,
    })),
  remove: (id) => {
    const snapshot = takeSnapshot(get());
    set((s) => ({
      deletedIds: [...s.deletedIds, id],
      history: s.history.filter((h) => h !== id),
      suggestions: s.suggestions.filter((item) => item.fromId !== id && item.intoId !== id),
    }));
    return snapshot;
  },
  restore: (id) =>
    set((s) => ({ deletedIds: s.deletedIds.filter((d) => d !== id), history: [], selectedId: id })),
  restoreSnapshot: (snapshot) => set({ ...snapshot }),
  select: (id) => set({ history: [], selectedId: id }),
  selectedId: 'ctx-ielts',
  setDemoState: (demoState) => set({ demoState }),
  setStatus: (id, status) =>
    set((s) => ({ entities: s.entities.map((e) => (e.id === id ? { ...e, status } : e)) })),
  suggestions: mockMergeSuggestions,
  updateNow: (id, now) =>
    set((s) => ({
      entities: s.entities.map((e) =>
        e.id === id
          ? { ...e, now, nowEditedBy: 'user', nowUpdatedAt: new Date().toISOString() }
          : e,
      ),
    })),
}));
