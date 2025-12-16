'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { CreateTodosParams, TodoItem } from '../../types';
import { SortableTodoList } from '../components';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 12px;
    padding-inline: 4px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
}));

const AddTodoIntervention = memo<BuiltinInterventionProps<CreateTodosParams>>(
  ({ args, onArgsChange, registerBeforeApprove }) => {
    const { styles } = useStyles();

    // Handle both formats:
    // - Initial AI input: { adds: string[] } (from AI)
    // - After user edit: { items: TodoItem[] } (saved format)
    const defaultItems: TodoItem[] =
      args?.items || args?.adds?.map((text) => ({ completed: false, text })) || [];

    const handleSave = useCallback(
      async (items: TodoItem[]) => {
        await onArgsChange?.({ items });
      },
      [onArgsChange],
    );

    return (
      <Flexbox className={styles.container}>
        <SortableTodoList
          defaultItems={defaultItems}
          onSave={handleSave}
          placeholder="Add a todo item..."
          registerBeforeApprove={registerBeforeApprove}
        />
      </Flexbox>
    );
  },
  isEqual,
);

AddTodoIntervention.displayName = 'AddTodoIntervention';

export default AddTodoIntervention;
