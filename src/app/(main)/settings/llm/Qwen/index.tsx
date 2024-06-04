'use client';

import { Tongyi } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const QwenProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'qwen-turbo'}
      modelList={{ showModelFetcher: true }}
      provider={ModelProvider.Qwen}
      title={<Tongyi.Combine extra={'千问'} size={26} type={'color'} />}
    />
  );
});

export default QwenProvider;
