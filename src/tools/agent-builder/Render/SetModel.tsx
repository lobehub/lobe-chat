import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { SetModelParams, SetModelState } from '../types';

const SetModel = memo<BuiltinRenderProps<SetModelParams, SetModelState>>(({ pluginState }) => {
  const { model, provider, previousModel, previousProvider } = pluginState || {};

  if (!model || !provider) return null;

  const hasChange = previousModel && previousProvider;

  return (
    <Flexbox gap={8} style={{ fontSize: 13 }}>
      <Flexbox align={'center'} gap={6} horizontal style={{ color: 'var(--lobe-success-6)' }}>
        <CheckCircle size={14} />
        <span style={{ fontWeight: 500 }}>Model updated</span>
      </Flexbox>

      {hasChange && (
        <Flexbox gap={4} style={{ marginLeft: 20 }}>
          <Flexbox align={'center'} gap={8} horizontal>
            <span style={{ color: 'var(--lobe-text-tertiary)', opacity: 0.7 }}>
              {previousProvider}/{previousModel}
            </span>
            <ChevronRight size={12} style={{ color: 'var(--lobe-text-tertiary)', opacity: 0.5 }} />
            <span style={{ color: 'var(--lobe-success-6)', fontWeight: 500 }}>
              {provider}/{model}
            </span>
          </Flexbox>
        </Flexbox>
      )}

      {!hasChange && (
        <Flexbox style={{ marginLeft: 20 }}>
          <span style={{ color: 'var(--lobe-text-secondary)' }}>
            {provider}/{model}
          </span>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default SetModel;
