'use client';

import { BuiltinInterventionProps } from '@lobechat/types';
import { createStyles } from 'antd-style';
import { memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useConversationStore } from '@/features/Conversation/store';

import type { AddTodoParams } from '../../types';
import SortableTodoList, { TodoListItem } from '../components/SortableTodoList';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 4px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
}));

/**
 * AddTodo Intervention component
 * Allows users to review and modify todo items before adding them
 */
const AddTodoIntervention = memo<BuiltinInterventionProps<AddTodoParams>>(({ args, messageId }) => {
  const { styles } = useStyles();
  const updatePluginArguments = useConversationStore((s) => s.updatePluginArguments);

  // Convert string items to TodoListItem format
  const items: TodoListItem[] = useMemo(
    () =>
      (args?.items || []).map((text, index) => ({
        id: `item_${index}_${text.slice(0, 10)}`,
        text,
      })),
    [args?.items],
  );

  // Handle items change from SortableTodoList
  const handleItemsChange = useCallback(
    (newItems: TodoListItem[]) => {
      const newArgs: AddTodoParams = {
        items: newItems.map((item) => item.text),
      };
      updatePluginArguments(messageId, newArgs, true);
    },
    [messageId, updatePluginArguments],
  );

  return (
    <Flexbox className={styles.container}>
      <SortableTodoList
        items={items}
        onChange={handleItemsChange}
        placeholder="Add a todo item..."
      />
    </Flexbox>
  );
});

AddTodoIntervention.displayName = 'AddTodoIntervention';

export default AddTodoIntervention;
