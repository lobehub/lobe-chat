'use client';

import { SortableList } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import AddItemRow from './AddItemRow';
import SortableItem from './SortableItem';
import { TodoListItem, useTodoListStore } from './store';

const useStyles = createStyles(({ css }) => ({
  container: css`
    width: 100%;

    &:hover .add-row {
      opacity: 1;
    }
  `,
}));

interface TodoListProps {
  placeholder?: string;
}

const TodoList = memo<TodoListProps>(({ placeholder }) => {
  const { styles } = useStyles();

  const items = useTodoListStore((s) => s.items);
  const sortItems = useTodoListStore((s) => s.sortItems);

  const handleSortEnd = useCallback(
    (sorted: unknown[]) => {
      sortItems(sorted as TodoListItem[]);
    },
    [sortItems],
  );

  const renderItem = useCallback(
    (item: TodoListItem) => {
      return <SortableItem id={item.id} placeholder={placeholder} />;
    },
    [placeholder],
  );

  // Empty state
  if (items.length === 0) {
    return (
      <Flexbox className={styles.container} gap={0}>
        <AddItemRow placeholder={placeholder} showDragHandle={false} />
      </Flexbox>
    );
  }

  return (
    <Flexbox className={styles.container} gap={0}>
      <SortableList items={items} onChange={handleSortEnd} renderItem={renderItem} />
      <AddItemRow className="add-row" placeholder={placeholder} />
    </Flexbox>
  );
});

TodoList.displayName = 'TodoList';

export default TodoList;
