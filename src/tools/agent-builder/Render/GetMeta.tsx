import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';

import type { GetAgentMetaParams, GetMetaState } from '../types';
import ConfigCard from './components/ConfigCard';

const GetMeta = memo<BuiltinRenderProps<GetAgentMetaParams, GetMetaState>>(({ pluginState }) => {
  const { meta } = pluginState || {};

  if (!meta) return null;

  return <ConfigCard config={meta as unknown as Record<string, unknown>} title="Agent Metadata" />;
});

export default GetMeta;
