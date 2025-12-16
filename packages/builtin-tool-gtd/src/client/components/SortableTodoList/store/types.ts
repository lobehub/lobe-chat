import { DebouncedFunc } from 'lodash-es';

import type { TodoItem } from '../../../../types';

export interface TodoListItem extends TodoItem {
  id: string;
}

export interface TodoListState {
  cursorPosition: number;
  focusedId: string | null;
  isDirty: boolean;
  items: TodoListItem[];
  newItemText: string;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export interface TodoListActions {
  addItem: () => void;
  deleteItem: (id: string) => void;
  flushSave: () => void;
  focusNextItem: (currentId: string | null, cursorPos: number) => void;
  focusPrevItem: (currentId: string | null, cursorPos: number) => void;
  setFocusedId: (id: string | null) => void;
  setNewItemText: (text: string) => void;
  sortItems: (sortedItems: TodoListItem[]) => void;
  toggleItem: (id: string) => void;
  updateItem: (id: string, text: string) => void;
}

export type TodoListStore = TodoListState & TodoListActions;

// Store internal state for debounce function
export interface StoreInternals {
  debouncedSave: DebouncedFunc<() => void> | null;
  onSave: ((items: TodoItem[]) => void | Promise<void>) | null;
}

// Special ID for the "add new item" input
export const ADD_ITEM_ID = '__add_item__';
