'use client';

import { Anthropic } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const AnthropicProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'claude-3-haiku-20240307'}
      provider={ModelProvider.Anthropic}
      showEndpoint
      title={<Anthropic.Text size={15} />}
    />
  );
});

export default AnthropicProvider;
