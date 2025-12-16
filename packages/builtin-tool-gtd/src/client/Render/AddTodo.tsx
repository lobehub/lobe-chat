import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle, Plus } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { AddTodoParams, AddTodoState } from '../../types';

const AddTodo = memo<BuiltinRenderProps<AddTodoParams, AddTodoState>>(({ pluginState }) => {
  const { addedItems, todos } = pluginState || {};

  if (!addedItems || addedItems.length === 0) {
    return null;
  }

  const totalItems = todos?.items?.length || 0;
  const completedCount = todos?.items?.filter((item) => item.done).length || 0;

  return (
    <Flexbox gap={8} style={{ fontSize: 13 }}>
      <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-success-6)' }}>
        <Plus size={14} />
        <span style={{ fontWeight: 500 }}>
          Added {addedItems.length} item{addedItems.length > 1 ? 's' : ''} to todo list
        </span>
      </Flexbox>

      <Flexbox
        gap={6}
        style={{
          background: 'var(--lobe-fill-tertiary)',
          borderLeft: '3px solid var(--lobe-success-6)',
          borderRadius: 6,
          marginLeft: 20,
          padding: 12,
        }}
      >
        {addedItems.map((item, index) => (
          <Flexbox align={'center'} gap={8} horizontal key={index}>
            <CheckCircle size={12} style={{ color: 'var(--lobe-text-quaternary)' }} />
            <span style={{ color: 'var(--lobe-text)' }}>{item}</span>
          </Flexbox>
        ))}
      </Flexbox>

      <Flexbox
        align={'center'}
        gap={4}
        horizontal
        style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12, marginLeft: 20 }}
      >
        <span>
          Total: {totalItems} item{totalItems !== 1 ? 's' : ''}
        </span>
        {completedCount > 0 && (
          <>
            <span>·</span>
            <span>
              {completedCount} done, {totalItems - completedCount} pending
            </span>
          </>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default AddTodo;
