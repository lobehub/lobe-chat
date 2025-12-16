'use client';

import { BuiltinRenderProps } from '@lobechat/types';
import { createStyles } from 'antd-style';
import { CheckCircle2, Circle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { TodoItem, TodoList as TodoListType } from '../../types';

export interface TodoListRenderState {
  todos?: TodoListType;
}

// Styles matching TodoItemRow in SortableTodoList
const useStyles = createStyles(({ css, token }) => ({
  checkbox: css`
    flex-shrink: 0;
    color: ${token.colorTextQuaternary};
  `,
  checkboxChecked: css`
    color: ${token.colorSuccess};
  `,
  // Outer container - matches AddTodoIntervention container style
  container: css`
    padding-block: 12px;
    padding-inline: 4px;
    border-radius: ${token.borderRadius}px;
    background: ${token.colorFillQuaternary};
  `,
  // Placeholder to match DragHandle width
  dragHandlePlaceholder: css`
    flex-shrink: 0;
    width: 16px;
    height: 24px;
  `,
  // Item row - matches TodoItemRow itemRow style
  itemRow: css`
    padding-block: 2px;
    border-block-end: 1px solid ${token.colorBorderSecondary};

    &:last-child {
      border-block-end: none;
    }
  `,
  text: css`
    flex: 1;
    font-size: 14px;
    line-height: 32px;
  `,
  textChecked: css`
    color: ${token.colorTextQuaternary};
    text-decoration: line-through;
  `,
}));

interface ReadOnlyTodoItemProps {
  completed: boolean;
  text: string;
}

/**
 * Read-only todo item row, matching the style of TodoItemRow in SortableTodoList
 */
const ReadOnlyTodoItem = memo<ReadOnlyTodoItemProps>(({ text, completed }) => {
  const { styles, cx } = useStyles();

  const CheckIcon = completed ? CheckCircle2 : Circle;

  return (
    <Flexbox align="center" className={styles.itemRow} gap={8} horizontal width="100%">
      <div className={styles.dragHandlePlaceholder} />
      <CheckIcon className={cx(styles.checkbox, completed && styles.checkboxChecked)} size={16} />
      <span className={cx(styles.text, completed && styles.textChecked)}>{text}</span>
    </Flexbox>
  );
});

ReadOnlyTodoItem.displayName = 'ReadOnlyTodoItem';

interface TodoListUIProps {
  items: TodoItem[];
}

/**
 * Read-only TodoList UI component
 * Displays todo items in a style matching the editable SortableTodoList
 */
const TodoListUI = memo<TodoListUIProps>(({ items }) => {
  const { styles } = useStyles();

  if (items.length === 0) {
    return null;
  }

  return (
    // Outer container with background - matches AddTodoIntervention
    <Flexbox className={styles.container}>
      <Flexbox width="100%">
        {items.map((item, index) => (
          <ReadOnlyTodoItem completed={item.completed} key={index} text={item.text} />
        ))}
      </Flexbox>
    </Flexbox>
  );
});

TodoListUI.displayName = 'TodoListUI';

/**
 * TodoList Render component for GTD tool
 * Read-only display of todo items matching the style of AddTodoIntervention
 */
const TodoListRender = memo<BuiltinRenderProps<unknown, TodoListRenderState>>(({ pluginState }) => {
  const todos = pluginState?.todos;
  const items: TodoItem[] = todos?.items || [];

  return <TodoListUI items={items} />;
});

TodoListRender.displayName = 'TodoListRender';

export default TodoListRender;
export { TodoListUI };
