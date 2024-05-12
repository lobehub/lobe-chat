'use client';

import { DeepSeek } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const DeepSeekProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'deepseek/deepseek-chat'}
      modelList={{ showModelFetcher: true }}
      provider={ModelProvider.DeepSeek}
      title={<DeepSeek.Combine size={28} type={'color'} />}
    />
  );
});

export default DeepSeekProvider;
