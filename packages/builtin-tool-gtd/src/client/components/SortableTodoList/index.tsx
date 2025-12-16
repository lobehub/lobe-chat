'use client';

import { useUnmount } from 'ahooks';
import { memo, useMemo } from 'react';

import type { TodoItem } from '../../../types';
import TodoList from './TodoList';
import { TodoListStoreContext, createTodoListStore } from './store';

export type { TodoListItem } from './store';

export interface SortableTodoListProps {
  /**
   * Default items for initialization (TodoItem array)
   */
  defaultItems?: TodoItem[];
  /**
   * Callback when items change (debounced, 3s after last change)
   * This is called automatically after content changes
   */
  onSave?: (items: TodoItem[]) => void | Promise<void>;
  /**
   * Placeholder text for inputs
   */
  placeholder?: string;
}

const SortableTodoList = memo<SortableTodoListProps>(
  ({ defaultItems = [], placeholder = 'Enter todo item...', onSave }) => {
    // Create store instance once with onSave callback
    const store = useMemo(() => createTodoListStore(defaultItems, onSave), []);

    // Flush pending saves on unmount to ensure no data loss
    useUnmount(() => {
      store.getState().flushSave();
    });

    return (
      <TodoListStoreContext.Provider value={store}>
        <TodoList placeholder={placeholder} />
      </TodoListStoreContext.Provider>
    );
  },
);

SortableTodoList.displayName = 'SortableTodoList';

export default SortableTodoList;
