'use client';

import { memo, useMemo } from 'react';

import TodoList from './TodoList';
import { TodoListStoreContext, createTodoListStore } from './store';

export type { TodoListItem } from './store';

export interface SortableTodoListProps {
  /**
   * Default items for initialization (string array)
   */
  defaultItems?: string[];
  /**
   * Placeholder text for inputs
   */
  placeholder?: string;
}

const SortableTodoList = memo<SortableTodoListProps>(
  ({ defaultItems = [], placeholder = 'Enter todo item...' }) => {
    // Create store instance once
    const store = useMemo(() => createTodoListStore(defaultItems), []);

    return (
      <TodoListStoreContext.Provider value={store}>
        <TodoList placeholder={placeholder} />
      </TodoListStoreContext.Provider>
    );
  },
);

SortableTodoList.displayName = 'SortableTodoList';

export default SortableTodoList;
