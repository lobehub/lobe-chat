'use client';

import { OpenRouter } from '@lobehub/icons';
import { memo } from 'react';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';

const OpenRouterProvider = memo(() => {
  return (
    <ProviderConfig
      checkModel={'mistralai/mistral-7b-instruct:free'}
      modelList={{ showModelFetcher: true }}
      provider={ModelProvider.OpenRouter}
      title={<OpenRouter.Combine iconProps={{ color: OpenRouter.colorPrimary }} size={20} />}
    />
  );
});

export default OpenRouterProvider;
