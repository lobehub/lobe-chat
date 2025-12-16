import { BuiltinRenderProps } from '@lobechat/types';
import { Trash2 } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ClearTodosParams, ClearTodosState } from '../../types';

const ClearTodos = memo<BuiltinRenderProps<ClearTodosParams, ClearTodosState>>(
  ({ pluginState }) => {
    const { clearedCount, mode, todos } = pluginState || {};

    const remainingItems = todos?.items?.length || 0;

    return (
      <Flexbox gap={8} style={{ fontSize: 13 }}>
        <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-warning-6)' }}>
          <Trash2 size={14} />
          <span style={{ fontWeight: 500 }}>
            {clearedCount === 0 ? (
              'No items to clear'
            ) : (
              <>
                Cleared {clearedCount} {mode === 'completed' ? 'completed' : ''} item
                {clearedCount !== 1 ? 's' : ''}
              </>
            )}
          </span>
        </Flexbox>

        {remainingItems > 0 && (
          <Flexbox
            align={'center'}
            gap={4}
            horizontal
            style={{ color: 'var(--lobe-text-tertiary)', fontSize: 12, marginLeft: 20 }}
          >
            <span>
              {remainingItems} item{remainingItems !== 1 ? 's' : ''} remaining
            </span>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default ClearTodos;
