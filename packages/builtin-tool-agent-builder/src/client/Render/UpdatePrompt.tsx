import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle, FileText } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { UpdatePromptParams, UpdatePromptState } from '../../types';

const UpdatePrompt = memo<BuiltinRenderProps<UpdatePromptParams, UpdatePromptState>>(
  ({ pluginState }) => {
    const { newPrompt } = pluginState || {};

    return (
      <Flexbox gap={8} style={{ fontSize: 13 }}>
        <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-success-6)' }}>
          <CheckCircle size={14} />
          <span style={{ fontWeight: 500 }}>
            {newPrompt ? 'System prompt updated' : 'System prompt cleared'}
          </span>
        </Flexbox>

        {newPrompt && (
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
              <FileText size={14} style={{ color: 'var(--lobe-text-tertiary)' }} />
              <span style={{ color: 'var(--lobe-text-secondary)', fontSize: 12, fontWeight: 500 }}>
                New prompt ({newPrompt.length} characters):
              </span>
            </Flexbox>
            <div
              style={{
                color: 'var(--lobe-text)',
                fontSize: 13,
                lineHeight: 1.6,
                marginLeft: 20,
                maxHeight: 200,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {newPrompt.length > 500 ? newPrompt.slice(0, 500) + '...' : newPrompt}
            </div>
          </Flexbox>
        )}
      </Flexbox>
    );
  },
);

export default UpdatePrompt;
