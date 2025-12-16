'use client';

import { ActionIcon } from '@lobehub/ui';
import { Input } from 'antd';
import { createStyles } from 'antd-style';
import { Circle, GripVertical, Plus } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useTodoListStore } from './store';

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
  dragHandle: css`
    flex-shrink: 0;
    color: ${token.colorTextQuaternary};
    opacity: 0;
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

    const newItemText = useTodoListStore((s) => s.newItemText);
    const setNewItemText = useTodoListStore((s) => s.setNewItemText);
    const addItem = useTodoListStore((s) => s.addItem);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setNewItemText(e.target.value);
      },
      [setNewItemText],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addItem();
        }
      },
      [addItem],
    );

    return (
      <Flexbox align="center" className={cx(styles.addRow, className)} gap={8} horizontal>
        {showDragHandle && <GripVertical className={styles.dragHandle} size={14} />}
        <Circle className={styles.circle} size={14} />
        <Input
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size="small"
          style={{ flex: 1 }}
          value={newItemText}
          variant="borderless"
        />
        <ActionIcon icon={Plus} onClick={addItem} size="small" />
      </Flexbox>
    );
  },
);

AddItemRow.displayName = 'AddItemRow';

export default AddItemRow;
