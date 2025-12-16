import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { CompleteTodoParams, CompleteTodoState } from '../../types';

const CompleteTodo = memo<BuiltinRenderProps<CompleteTodoParams, CompleteTodoState>>(
  ({ pluginState }) => {
    const { completedIndices, todos } = pluginState || {};

    if (!completedIndices || completedIndices.length === 0) {
      return null;
    }

    const totalItems = todos?.items?.length || 0;
    const completedCount = todos?.items?.filter((item) => item.done).length || 0;
    const pendingCount = totalItems - completedCount;

    return (
      <Flexbox gap={8} style={{ fontSize: 13 }}>
        <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-success-6)' }}>
          <CheckCircle size={14} />
          <span style={{ fontWeight: 500 }}>
            Completed {completedIndices.length} item{completedIndices.length > 1 ? 's' : ''}
          </span>
        </Flexbox>

        <Flexbox
          align={'center'}
          gap={4}
          horizontal
          style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12, marginLeft: 20 }}
        >
          <span>
            {completedCount} done, {pendingCount} pending
          </span>
        </Flexbox>
      </Flexbox>
    );
  },
);

export default CompleteTodo;
