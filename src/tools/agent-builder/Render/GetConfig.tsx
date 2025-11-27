import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';

import type { GetAgentConfigParams, GetConfigState } from '../types';
import ConfigCard from './components/ConfigCard';

const GetConfig = memo<BuiltinRenderProps<GetAgentConfigParams, GetConfigState>>(
  ({ pluginState }) => {
    const { config } = pluginState || {};

    if (!config) return null;

    return (
      <ConfigCard
        config={config as unknown as Record<string, unknown>}
        title="Agent Configuration"
      />
    );
  },
);

export default GetConfig;
