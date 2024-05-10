'use client';

import { Ollama } from '@lobehub/icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';

import ProviderConfig from '../components/ProviderConfig';
import Checker from './Checker';

const OllamaProvider = memo(() => {
  const { t } = useTranslation('modelProvider');

  return (
    <ProviderConfig
      checkerItem={{
        children: <Checker />,
        desc: t('ollama.checker.desc'),
        label: t('ollama.checker.title'),
        minWidth: undefined,
      }}
      modelList={{ showModelFetcher: true }}
      provider={ModelProvider.Ollama}
      proxyUrl={{
        desc: t('ollama.endpoint.desc'),
        placeholder: 'http://127.0.0.1:11434',
        title: t('ollama.endpoint.title'),
      }}
      showApiKey={false}
      showBrowserRequest
      title={<Ollama.Combine size={28} />}
    />
  );
});

export default OllamaProvider;
