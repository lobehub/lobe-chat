'use client';

import { ActionIcon } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { Circle, GripVertical, Trash2 } from 'lucide-react';
import { ChangeEvent, memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useTodoListStore } from './store';

const useStyles = createStyles(({ css, token }) => ({
  circle: css`
    flex-shrink: 0;
    color: ${token.colorTextQuaternary};
  `,
  deleteIcon: css`
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s;
  `,
  dragHandle: css`
    cursor: grab;

    flex-shrink: 0;

    color: ${token.colorTextQuaternary};

    opacity: 0;

    transition: opacity 0.2s;

    &:active {
      cursor: grabbing;
    }
  `,
  itemRow: css`
    padding-block: 2px;
    border-block-end: 1px solid ${token.colorBorderSecondary};

    &:last-child {
      border-block-end: none;
    }

    &:hover {
      .drag-handle,
      .delete-icon {
        opacity: 1;
      }
    }
  `,
}));

interface TodoItemRowProps {
  id: string;
  placeholder?: string;
}

const TodoItemRow = memo<TodoItemRowProps>(({ id, placeholder = 'Enter todo item...' }) => {
  const { styles, cx } = useStyles();

  // Find item by stable id
  const text = useTodoListStore((s) => s.items.find((item) => item.id === id)?.text ?? '');
  const updateItem = useTodoListStore((s) => s.updateItem);
  const deleteItem = useTodoListStore((s) => s.deleteItem);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateItem(id, e.target.value);
    },
    [id, updateItem],
  );

  const handleDelete = useCallback(() => {
    deleteItem(id);
  }, [id, deleteItem]);

  return (
    <Flexbox align="center" className={styles.itemRow} gap={8} horizontal width="100%">
      <GripVertical className={cx(styles.dragHandle, 'drag-handle')} size={14} />
      <Circle className={styles.circle} size={14} />
      <Input
        onChange={handleChange}
        placeholder={placeholder}
        size="small"
        style={{ flex: 1 }}
        value={text}
        variant="borderless"
      />
      <ActionIcon
        className={cx(styles.deleteIcon, 'delete-icon')}
        icon={Trash2}
        onClick={handleDelete}
        size="small"
      />
    </Flexbox>
  );
});

TodoItemRow.displayName = 'TodoItemRow';

export default TodoItemRow;
