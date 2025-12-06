import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle, MessageSquare } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { SetOpeningMessageParams, SetOpeningMessageState } from '../types';

const SetOpeningMessage = memo<BuiltinRenderProps<SetOpeningMessageParams, SetOpeningMessageState>>(
  ({ pluginState }) => {
    const { message } = pluginState || {};

    return (
      <Flexbox gap={8} style={{ fontSize: 13 }}>
        <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-success-6)' }}>
          <CheckCircle size={14} />
          <span style={{ fontWeight: 500 }}>
            {message ? 'Opening message set' : 'Opening message removed'}
          </span>
        </Flexbox>

        {message && (
          <Flexbox
            gap={8}
            style={{
              background: 'var(--lobe-fill-tertiary)',
              borderLeft: '3px solid var(--lobe-success-6)',
              borderRadius: 6,
              marginLeft: 20,
              padding: 12,
            }}
          >
            <Flexbox align={'center'} gap={6} horizontal>
              <MessageSquare size={14} style={{ color: 'var(--lobe-text-tertiary)' }} />
              <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12, fontWeight: 500 }}>
                New opening message:
              </span>
            </Flexbox>
            <div
              style={{
                color: 'var(--lobe-text)',
                fontSize: 13,
                lineHeight: 1.6,
                marginLeft: 20,
                whiteSpace: 'pre-wrap',
              }}
            >
              {message}
            </div>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default SetOpeningMessage;
