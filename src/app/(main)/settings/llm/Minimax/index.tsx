'use client';

import { Minimax } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const MinimaxProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'abab5.5s-chat'}
      provider={ModelProvider.Minimax}
      title={<Minimax.Combine size={32} type={'color'} />}
    />
  );
});

export default MinimaxProvider;
