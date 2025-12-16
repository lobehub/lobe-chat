'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { AddTodoParams } from '../../types';
import { SortableTodoList, TodoListItem } from '../components';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 12px;
    padding-inline: 4px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
}));

const AddTodoIntervention = memo<BuiltinInterventionProps<AddTodoParams>>(
  ({ args, onArgsChange }) => {
    const { styles } = useStyles();

    // Pass string array directly
    const defaultItems = args?.items || [];

    const handleSave = useCallback(
      async (items: TodoListItem[]) => {
        await onArgsChange?.({ items: items.map((item) => item.text) });
      },
      [onArgsChange],
    );

    return (
      <Flexbox className={styles.container}>
        <SortableTodoList
          defaultItems={defaultItems}
          onSave={handleSave}
          placeholder="Add a todo item..."
        />
      </Flexbox>
    );
  },
  isEqual,
);

AddTodoIntervention.displayName = 'AddTodoIntervention';

export default AddTodoIntervention;
