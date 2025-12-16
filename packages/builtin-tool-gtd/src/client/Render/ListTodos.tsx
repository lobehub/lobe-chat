import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle, Circle, ListTodo } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ListTodosState } from '../../types';

const ListTodos = memo<BuiltinRenderProps<Record<string, never>, ListTodosState>>(
  ({ pluginState }) => {
    const { todos } = pluginState || {};
    const items = todos?.items || [];

    if (items.length === 0) {
      return (
        <Flexbox
          align={'center'}
          gap={6}
          horizontal
          style={{ color: 'var(--lobe-text-tertiary)', fontSize: 13 }}
        >
          <ListTodo size={14} />
          <span>Todo list is empty</span>
        </Flexbox>
      );
    }

    const completedCount = items.filter((item) => item.done).length;
    const pendingCount = items.length - completedCount;

    return (
      <Flexbox gap={8} style={{ fontSize: 13 }}>
        <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-primary-6)' }}>
          <ListTodo size={14} />
          <span style={{ fontWeight: 500 }}>
            Todo List ({items.length} item{items.length !== 1 ? 's' : ''})
          </span>
          <span style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12 }}>
            {completedCount} done, {pendingCount} pending
          </span>
        </Flexbox>

        <Flexbox
          gap={4}
          style={{
            background: 'var(--lobe-fill-tertiary)',
            borderRadius: 6,
            marginLeft: 20,
            maxHeight: 300,
            overflow: 'auto',
            padding: 12,
          }}
        >
          {items.map((item, index) => (
            <Flexbox align={'center'} gap={8} horizontal key={index}>
              {item.done ? (
                <CheckCircle size={12} style={{ color: 'var(--lobe-success-6)' }} />
              ) : (
                <Circle size={12} style={{ color: 'var(--lobe-text-quaternary)' }} />
              )}
              <span
                style={{
                  color: item.done ? 'var(--lobe-text-tertiary)' : 'var(--lobe-text)',
                  textDecoration: item.done ? 'line-through' : 'none',
                }}
              >
                {item.text}
              </span>
            </Flexbox>
          ))}
        </Flexbox>
      </Flexbox>
    );
  },
);

export default ListTodos;
