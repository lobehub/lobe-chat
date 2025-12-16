import { createContext, useContext } from 'react';
import { StoreApi, createStore, useStore } from 'zustand';

export interface TodoListItem {
  checked: boolean;
  id: string;
  text: string;
}

interface TodoListState {
  cursorPosition: number;
  focusedId: string | null;
  items: TodoListItem[];
  newItemText: string;
}

interface TodoListActions {
  addItem: () => void;
  deleteItem: (id: string) => void;
  focusNextItem: (currentId: string | null, cursorPos: number) => void;
  focusPrevItem: (currentId: string | null, cursorPos: number) => void;
  setFocusedId: (id: string | null) => void;
  setNewItemText: (text: string) => void;
  sortItems: (sortedItems: TodoListItem[]) => void;
  toggleItem: (id: string) => void;
  updateItem: (id: string, text: string) => void;
}

export type TodoListStore = TodoListState & TodoListActions;

let idCounter = 0;
const generateId = () => `todo-${Date.now()}-${idCounter++}`;

// Special ID for the "add new item" input
export const ADD_ITEM_ID = '__add_item__';

const initialState = {
  // State
  cursorPosition: 0,
  focusedId: null,

  newItemText: '',
};
export const createTodoListStore = (defaultItems: string[] = []) =>
  createStore<TodoListStore>((set, get) => ({
    ...initialState,
    items: defaultItems.map((text) => ({ checked: false, id: generateId(), text })),

    /* eslint-disable sort-keys-fix/sort-keys-fix */
    addItem: () => {
      const { items, newItemText } = get();
      if (!newItemText.trim()) return;

      set({
        items: [...items, { checked: false, id: generateId(), text: newItemText.trim() }],
        newItemText: '',
      });
    },

    deleteItem: (id: string) => {
      const { items } = get();
      set({
        items: items.filter((item) => item.id !== id),
      });
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
    },

    toggleItem: (id: string) => {
      const { items } = get();
      set({
        items: items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
      });
    },

    updateItem: (id: string, text: string) => {
      const { items } = get();
      set({
        items: items.map((item) => (item.id === id ? { ...item, text } : item)),
      });
    },
  }));

// Context for the store
export const TodoListStoreContext = createContext<StoreApi<TodoListStore> | null>(null);

// Hook to use the store
export const useTodoListStore = <T>(selector: (state: TodoListStore) => T): T => {
  const store = useContext(TodoListStoreContext);
  if (!store) {
    throw new Error('useTodoListStore must be used within TodoListStoreContext.Provider');
  }
  return useStore(store, selector);
};
