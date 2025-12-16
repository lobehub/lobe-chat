'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { AddTodoParams } from '../../types';
import { SortableTodoList } from '../components';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding-block: 12px;
    padding-inline: 4px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
}));

/**
 * AddTodo Intervention component
 * Allows users to review and modify todo items before adding them
 */
const AddTodoIntervention = memo<BuiltinInterventionProps<AddTodoParams>>(({ args }) => {
  const { styles } = useStyles();

  // Pass string array directly
  const defaultItems = args?.items || [];

  return (
    <Flexbox className={styles.container}>
      <SortableTodoList defaultItems={defaultItems} placeholder="Add a todo item..." />
    </Flexbox>
  );
}, isEqual);

AddTodoIntervention.displayName = 'AddTodoIntervention';

export default AddTodoIntervention;
