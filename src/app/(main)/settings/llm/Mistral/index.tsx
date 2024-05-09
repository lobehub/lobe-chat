'use client';

import { Mistral } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const MistralProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'open-mistral-7b'}
      provider={ModelProvider.Mistral}
      title={<Mistral.Combine size={26} type={'color'} />}
    />
  );
});

export default MistralProvider;
