import { createContext, useContext } from 'react';
import { StoreApi, createStore, useStore } from 'zustand';

export interface TodoListItem {
  id: string;
  text: string;
}

interface TodoListState {
  items: TodoListItem[];
  newItemText: string;
}

interface TodoListActions {
  addItem: () => void;
  deleteItem: (id: string) => void;
  setNewItemText: (text: string) => void;
  sortItems: (sortedItems: TodoListItem[]) => void;
  updateItem: (id: string, text: string) => void;
}

export type TodoListStore = TodoListState & TodoListActions;

let idCounter = 0;
const generateId = () => `todo-${Date.now()}-${idCounter++}`;

export const createTodoListStore = (defaultItems: string[] = []) =>
  createStore<TodoListStore>((set, get) => ({
    
    // Actions
addItem: () => {
      const { newItemText, items } = get();
      if (!newItemText.trim()) return;

      set({
        items: [...items, { id: generateId(), text: newItemText.trim() }],
        newItemText: '',
      });
    },
    

deleteItem: (id: string) => {
      const { items } = get();
      set({
        items: items.filter((item) => item.id !== id),
      });
    },

    
    // State - convert string array to TodoListItem array with stable IDs
items: defaultItems.map((text) => ({ id: generateId(), text })),

    newItemText: '',

    setNewItemText: (text: string) => {
      set({ newItemText: text });
    },

    sortItems: (sortedItems: TodoListItem[]) => {
      set({ items: sortedItems });
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
