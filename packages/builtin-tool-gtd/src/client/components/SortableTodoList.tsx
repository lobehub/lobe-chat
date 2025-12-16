'use client';

import { ActionIcon, SortableList } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { Circle, GripVertical, Plus, Trash2 } from 'lucide-react';
import { KeyboardEvent, memo, useCallback, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  addRow: css`
    padding-block: 6px;
    opacity: 0;
    transition: opacity 0.2s;
  `,
  circle: css`
    flex-shrink: 0;
    color: ${token.colorTextQuaternary};
  `,
  container: css`
    width: 100%;

    &:hover .add-row {
      opacity: 1;
    }
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

export interface TodoListItem {
  id: string;
  text: string;
}

export interface SortableTodoListProps {
  items: TodoListItem[];
  onChange: (items: TodoListItem[]) => void;
  placeholder?: string;
}

const SortableTodoList = memo<SortableTodoListProps>(
  ({ items, onChange, placeholder = 'Enter todo item...' }) => {
    const { styles, cx } = useStyles();
    const [newItemText, setNewItemText] = useState('');
    const newInputRef = useRef<any>(null);

    // Generate unique ID
    const generateId = useCallback(
      () => `todo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      [],
    );

    // Update item text
    const handleUpdateItem = useCallback(
      (id: string, text: string) => {
        onChange(items.map((item) => (item.id === id ? { ...item, text } : item)));
      },
      [items, onChange],
    );

    // Delete item
    const handleDelete = useCallback(
      (id: string) => {
        onChange(items.filter((item) => item.id !== id));
      },
      [items, onChange],
    );

    // Add new item
    const handleAdd = useCallback(() => {
      if (!newItemText.trim()) return;

      const newItem: TodoListItem = {
        id: generateId(),
        text: newItemText.trim(),
      };
      onChange([...items, newItem]);
      setNewItemText('');
    }, [newItemText, items, onChange, generateId]);

    // Handle sort
    const handleSortEnd = useCallback(
      (sortedItems: TodoListItem[]) => {
        onChange(sortedItems);
      },
      [onChange],
    );

    // Handle key down for new item input
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAdd();
        }
      },
      [handleAdd],
    );

    return (
      <Flexbox className={styles.container} gap={0}>
        {items.length === 0 ? (
          // Empty state - show input directly
          <Flexbox align="center" gap={8} horizontal style={{ paddingBlock: 6 }}>
            <Circle className={styles.circle} size={14} />
            <Input
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              size="small"
              style={{ flex: 1 }}
              value={newItemText}
              variant="borderless"
            />
            <ActionIcon icon={Plus} onClick={handleAdd} size="small" />
          </Flexbox>
        ) : (
          <>
            <SortableList
              items={items}
              onChange={(sorted) => handleSortEnd(sorted as TodoListItem[])}
              renderItem={(item) => {
                const todoItem = item as TodoListItem;
                return (
                  <SortableList.Item id={todoItem.id} style={{ padding: 0 }}>
                    <Flexbox
                      align="center"
                      className={styles.itemRow}
                      gap={8}
                      horizontal
                      width="100%"
                    >
                      <GripVertical className={cx(styles.dragHandle, 'drag-handle')} size={14} />
                      <Circle className={styles.circle} size={14} />
                      <Input
                        onChange={(e) => handleUpdateItem(todoItem.id, e.target.value)}
                        placeholder={placeholder}
                        size="small"
                        style={{ flex: 1 }}
                        value={todoItem.text}
                        variant="borderless"
                      />
                      <ActionIcon
                        className={cx(styles.deleteIcon, 'delete-icon')}
                        icon={Trash2}
                        onClick={() => handleDelete(todoItem.id)}
                        size="small"
                      />
                    </Flexbox>
                  </SortableList.Item>
                );
              }}
            />

            {/* Add new item row - visible on hover */}
            <Flexbox align="center" className={cx(styles.addRow, 'add-row')} gap={8} horizontal>
              <GripVertical className={styles.dragHandle} size={14} style={{ opacity: 0 }} />
              <Circle className={styles.circle} size={14} />
              <Input
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                ref={newInputRef}
                size="small"
                style={{ flex: 1 }}
                value={newItemText}
                variant="borderless"
              />
              <ActionIcon icon={Plus} onClick={handleAdd} size="small" />
            </Flexbox>
          </>
        )}
      </Flexbox>
    );
  },
);

SortableTodoList.displayName = 'SortableTodoList';

export default SortableTodoList;
