'use client';

import { Perplexity } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const PerplexityProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'pplx-7b-chat'}
      provider={ModelProvider.Perplexity}
      title={<Perplexity.Combine size={24} type={'color'} />}
    />
  );
});

export default PerplexityProvider;
