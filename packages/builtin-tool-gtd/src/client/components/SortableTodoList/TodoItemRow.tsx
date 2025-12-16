'use client';

import { ActionIcon, SortableList } from '@lobehub/ui';
import { Input, InputRef } from 'antd';
import { createStyles } from 'antd-style';
import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, memo, useCallback, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useTodoListStore } from './store';

const useStyles = createStyles(({ css, token }) => ({
  checkbox: css`
    cursor: pointer;
    flex-shrink: 0;
    color: ${token.colorTextQuaternary};
    transition: color 0.2s;

    &:hover {
      color: ${token.colorPrimary};
    }
  `,
  checkboxChecked: css`
    color: ${token.colorSuccess};

    &:hover {
      color: ${token.colorSuccessHover};
    }
  `,
  deleteIcon: css`
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s;
  `,
  dragHandle: css`
    flex-shrink: 0;
    width: 20px !important;
    opacity: 0;
    transition: opacity 0.2s;
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
  textChecked: css`
    color: ${token.colorTextQuaternary};
    text-decoration: line-through;
  `,
}));

interface TodoItemRowProps {
  id: string;
  placeholder?: string;
}

const TodoItemRow = memo<TodoItemRowProps>(({ id, placeholder = 'Enter todo item...' }) => {
  const { styles, cx } = useStyles();
  const inputRef = useRef<InputRef>(null);

  // Find item by stable id
  const item = useTodoListStore((s) => s.items.find((item) => item.id === id));
  const text = item?.text ?? '';
  const checked = item?.checked ?? false;

  const focusedId = useTodoListStore((s) => s.focusedId);
  const cursorPosition = useTodoListStore((s) => s.cursorPosition);
  const updateItem = useTodoListStore((s) => s.updateItem);
  const deleteItem = useTodoListStore((s) => s.deleteItem);
  const toggleItem = useTodoListStore((s) => s.toggleItem);
  const focusPrevItem = useTodoListStore((s) => s.focusPrevItem);
  const focusNextItem = useTodoListStore((s) => s.focusNextItem);
  const setFocusedId = useTodoListStore((s) => s.setFocusedId);

  // Focus input when focusedId changes to this item and restore cursor position
  const prevFocusedIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Only restore cursor when focus changes TO this item (not on every cursorPosition change)
    if (focusedId === id && prevFocusedIdRef.current !== id) {
      const input = inputRef.current?.input;
      if (input) {
        input.focus();
        // Clamp cursor position to text length
        const pos = Math.min(cursorPosition, text.length);
        input.setSelectionRange(pos, pos);
      }
    }
    prevFocusedIdRef.current = focusedId;
  }, [focusedId, id, cursorPosition, text.length]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateItem(id, e.target.value);
    },
    [id, updateItem],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const cursorPos = input.selectionStart ?? 0;

      if (e.key === 'Backspace' && text === '') {
        e.preventDefault();
        focusPrevItem(id, cursorPos);
        deleteItem(id);
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        focusPrevItem(id, cursorPos);
      } else if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        focusNextItem(id, cursorPos);
      }
    },
    [id, text, deleteItem, focusPrevItem, focusNextItem],
  );

  const handleFocus = useCallback(() => {
    setFocusedId(id);
  }, [id, setFocusedId]);

  const handleDelete = useCallback(() => {
    focusPrevItem(id, 0);
    deleteItem(id);
  }, [id, deleteItem, focusPrevItem]);

  const handleToggle = useCallback(() => {
    toggleItem(id);
  }, [id, toggleItem]);

  const CheckIcon = checked ? CheckCircle2 : Circle;

  return (
    <Flexbox align="center" className={styles.itemRow} gap={4} horizontal width="100%">
      <SortableList.DragHandle className={cx(styles.dragHandle, 'drag-handle')} size="small" />
      <CheckIcon
        className={cx(styles.checkbox, checked && styles.checkboxChecked)}
        onClick={handleToggle}
        size={16}
      />
      <Input
        className={cx(checked && styles.textChecked)}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        ref={inputRef}
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
        tabIndex={-1}
      />
    </Flexbox>
  );
});

TodoItemRow.displayName = 'TodoItemRow';

export default TodoItemRow;
