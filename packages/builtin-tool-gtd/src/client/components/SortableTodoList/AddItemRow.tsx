'use client';

import { ActionIcon } from '@lobehub/ui';
import { Input, InputRef } from 'antd';
import { createStyles } from 'antd-style';
import { Circle, Plus } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, memo, useCallback, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ADD_ITEM_ID, useTodoListStore } from './store';

const useStyles = createStyles(({ css, token }) => ({
  addRow: css`
    padding-block: 6px;
  `,
  circle: css`
    flex-shrink: 0;
    color: ${token.colorTextQuaternary};
  `,
  // Placeholder to match DragHandle width (28px from SortableList.DragHandle small size)
  dragHandlePlaceholder: css`
    flex-shrink: 0;
    width: 24px;
    height: 24px;
  `,
}));

interface AddItemRowProps {
  className?: string;
  placeholder?: string;
  showDragHandle?: boolean;
}

const AddItemRow = memo<AddItemRowProps>(
  ({ placeholder = 'Add a todo item...', showDragHandle = true, className }) => {
    const { styles, cx } = useStyles();
    const inputRef = useRef<InputRef>(null);

    const newItemText = useTodoListStore((s) => s.newItemText);
    const focusedId = useTodoListStore((s) => s.focusedId);
    const cursorPosition = useTodoListStore((s) => s.cursorPosition);
    const setNewItemText = useTodoListStore((s) => s.setNewItemText);
    const addItem = useTodoListStore((s) => s.addItem);
    const focusPrevItem = useTodoListStore((s) => s.focusPrevItem);
    const setFocusedId = useTodoListStore((s) => s.setFocusedId);

    // Focus input when focusedId changes to this input and restore cursor position
    const prevFocusedIdRef = useRef<string | null>(null);
    useEffect(() => {
      // Only restore cursor when focus changes TO this input (not on every cursorPosition change)
      if (focusedId === ADD_ITEM_ID && prevFocusedIdRef.current !== ADD_ITEM_ID) {
        const input = inputRef.current?.input;
        if (input) {
          input.focus();
          // Clamp cursor position to text length
          const pos = Math.min(cursorPosition, newItemText.length);
          input.setSelectionRange(pos, pos);
        }
      }
      prevFocusedIdRef.current = focusedId;
    }, [focusedId, cursorPosition, newItemText.length]);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setNewItemText(e.target.value);
      },
      [setNewItemText],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const cursorPos = input.selectionStart ?? 0;

        if (e.key === 'Enter') {
          e.preventDefault();
          addItem();
        } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
          e.preventDefault();
          focusPrevItem(ADD_ITEM_ID, cursorPos);
        } else if (e.key === 'Tab' && !e.shiftKey) {
          // Prevent default tab behavior to keep focus in the todo list
          e.preventDefault();
        }
      },
      [addItem, focusPrevItem],
    );

    const handleFocus = useCallback(() => {
      setFocusedId(ADD_ITEM_ID);
    }, [setFocusedId]);

    return (
      <Flexbox align="center" className={cx(styles.addRow, className)} gap={8} horizontal>
        {showDragHandle && <div className={styles.dragHandlePlaceholder} />}
        <Circle className={styles.circle} size={16} />
        <Input
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          size="small"
          style={{ flex: 1 }}
          value={newItemText}
          variant="borderless"
        />
        <ActionIcon icon={Plus} onClick={addItem} size="small" tabIndex={-1} />
      </Flexbox>
    );
  },
);

AddItemRow.displayName = 'AddItemRow';

export default AddItemRow;
