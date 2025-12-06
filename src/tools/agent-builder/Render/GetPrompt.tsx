import { BuiltinRenderProps } from '@lobechat/types';
import { FileText } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { GetPromptParams, GetPromptState } from '../types';

const GetPrompt = memo<BuiltinRenderProps<GetPromptParams, GetPromptState>>(({ pluginState }) => {
  const { prompt } = pluginState || {};

  if (!prompt) {
    return (
      <Flexbox gap={8} style={{ fontSize: 13 }}>
        <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-text-tertiary)' }}>
          <FileText size={14} />
          <span>No system prompt is currently set.</span>
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={8} style={{ fontSize: 13 }}>
      <Flexbox align={'center'} gap={6} horizontal>
        <FileText size={14} style={{ color: 'var(--lobe-primary-6)' }} />
        <span style={{ color: 'var(--lobe-text-secondary)', fontWeight: 500 }}>
          System Prompt ({prompt.length} characters)
        </span>
      </Flexbox>
      <div
        style={{
          background: 'var(--lobe-fill-tertiary)',
          borderLeft: '3px solid var(--lobe-primary-6)',
          borderRadius: 6,
          fontSize: 13,
          lineHeight: 1.6,
          marginLeft: 20,
          maxHeight: 300,
          overflow: 'auto',
          padding: 12,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {prompt}
      </div>
    </Flexbox>
  );
});

export default GetPrompt;
