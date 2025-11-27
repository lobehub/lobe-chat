import { BuiltinRenderProps } from '@lobechat/types';
import { CheckCircle, XCircle } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { TogglePluginParams, TogglePluginState } from '../types';

const TogglePlugin = memo<BuiltinRenderProps<TogglePluginParams, TogglePluginState>>(
  ({ pluginState }) => {
    const { pluginId, enabled } = pluginState || {};

    if (!pluginId) return null;

    return (
      <Flexbox align={'center'} gap={8} horizontal style={{ fontSize: 13 }}>
        {enabled ? (
          <CheckCircle size={14} style={{ color: 'var(--lobe-success-6)' }} />
        ) : (
          <XCircle size={14} style={{ color: 'var(--lobe-text-tertiary)' }} />
        )}
        <span style={{ fontWeight: 500 }}>
          {enabled ? 'Enabled' : 'Disabled'} plugin:{' '}
          <code
            style={{
              background: 'var(--lobe-fill-tertiary)',
              borderRadius: 4,
              color: 'var(--lobe-text)',
              fontSize: 12,
              padding: '2px 6px',
            }}
          >
            {pluginId}
          </code>
        </span>
      </Flexbox>
    );
  },
);

export default TogglePlugin;
