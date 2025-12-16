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

  // Use items length as key to force remount when items change structure
  // This fixes DragOverlay position issues after drag operations
  const listKey = items.map((i) => i.id).join('-');

  return (
    <Flexbox paddingBlock={8} paddingInline={4} width={'100%'}>
      <SortableList
        items={items}
        key={listKey}
        onChange={handleSortEnd}
        renderItem={renderItem}
        style={{ marginBottom: 0 }}
      />
      <AddItemRow placeholder={placeholder} />
    </Flexbox>
  );
});

TodoList.displayName = 'TodoList';

export default TodoList;
