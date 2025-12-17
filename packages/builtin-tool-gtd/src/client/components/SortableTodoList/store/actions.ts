import { debounce } from 'lodash-es';

import type { TodoItem } from '../../../../types';
import { AUTO_SAVE_DELAY, AUTO_SAVE_MAX_WAIT, initialState } from './initialState';
import type { StoreInternals, TodoListItem, TodoListStore } from './types';
import { ADD_ITEM_ID } from './types';

let idCounter = 0;
export const generateId = () => `todo-${Date.now()}-${idCounter++}`;

// Reset counter for testing
export const resetIdCounter = () => {
  idCounter = 0;
};

type SetState = (
  partial: Partial<TodoListStore> | ((state: TodoListStore) => Partial<TodoListStore>),
) => void;
type GetState = () => TodoListStore;

export const createActions = (
  set: SetState,
  get: GetState,
  internals: StoreInternals,
  defaultItems: TodoItem[],
): TodoListStore => {
  // Save implementation (used by both debounced and immediate save)
  const performSave = async () => {
    if (!internals.onSave) return;

    const { items, isDirty } = get();
    if (!isDirty) return;

    set({ saveStatus: 'saving' });

    try {
      // Convert TodoListItem[] to TodoItem[] (remove id)
      const todoItems: TodoItem[] = items.map(({ completed, text }) => ({ completed, text }));
      await internals.onSave(todoItems);
      set({ isDirty: false, saveStatus: 'saved' });

      // Reset to idle after showing "saved" briefly
      setTimeout(() => {
        set((state) => (state.saveStatus === 'saved' ? { saveStatus: 'idle' } : {}));
      }, 1500);
    } catch {
      set({ saveStatus: 'error' });
    }
  };

  internals.debouncedSave = debounce(performSave, AUTO_SAVE_DELAY, {
    leading: false,
    maxWait: AUTO_SAVE_MAX_WAIT,
    trailing: true,
  });

  // Helper to mark dirty and trigger debounced save
  const markDirtyAndSave = () => {
    set({ isDirty: true });
    internals.debouncedSave?.();
  };

  return {
    ...initialState,
    items: defaultItems.map((item) => ({ ...item, id: generateId() })),

    /* eslint-disable sort-keys-fix/sort-keys-fix */
    addItem: () => {
      const { items, newItemText } = get();
      if (!newItemText.trim()) return;

      set({
        items: [...items, { completed: false, id: generateId(), text: newItemText.trim() }],
        newItemText: '',
      });
      markDirtyAndSave();
    },

    deleteItem: (id: string) => {
      const { items } = get();
      set({
        items: items.filter((item) => item.id !== id),
      });
      markDirtyAndSave();
    },

    flushSave: () => {
      internals.debouncedSave?.flush();
    },

    saveNow: async () => {
      // Cancel pending debounced save to avoid double-save
      internals.debouncedSave?.cancel();
      // Immediately save if dirty
      await performSave();
    },

    focusNextItem: (currentId: string | null, cursorPos: number) => {
      const { items } = get();
      if (currentId === null) return;

      if (currentId === ADD_ITEM_ID) return; // Already at the end

      const currentIndex = items.findIndex((item) => item.id === currentId);
      if (currentIndex === -1) return;

      if (currentIndex < items.length - 1) {
        set({ cursorPosition: cursorPos, focusedId: items[currentIndex + 1].id });
      } else {
        // At last item, go to add input
        set({ cursorPosition: cursorPos, focusedId: ADD_ITEM_ID });
      }
    },

    focusPrevItem: (currentId: string | null, cursorPos: number) => {
      const { items } = get();
      if (items.length === 0) return;

      if (currentId === ADD_ITEM_ID) {
        // From add input, go to last item
        set({ cursorPosition: cursorPos, focusedId: items.at(-1)?.id ?? null });
      } else if (currentId) {
        const currentIndex = items.findIndex((item) => item.id === currentId);
        if (currentIndex > 0) {
          set({ cursorPosition: cursorPos, focusedId: items[currentIndex - 1].id });
        }
      }
    },

    setFocusedId: (id: string | null) => {
      set({ focusedId: id });
    },

    setNewItemText: (text: string) => {
      set({ newItemText: text });
    },

    sortItems: (sortedItems: TodoListItem[]) => {
      set({ items: sortedItems });
      markDirtyAndSave();
    },

    toggleItem: (id: string) => {
      const { items } = get();
      set({
        items: items.map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      });
      markDirtyAndSave();
    },

    updateItem: (id: string, text: string) => {
      const { items } = get();
      set({
        items: items.map((item) => (item.id === id ? { ...item, text } : item)),
      });
      markDirtyAndSave();
    },
  };
};
