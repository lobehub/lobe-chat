'use client';

import { useTranslation } from 'react-i18next';

import { OllamaProviderCard } from '@/config/modelProviders';

import { ProviderItem } from '../../type';

export const useOllamaProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...OllamaProviderCard,
    proxyUrl: {
      desc: t('ollama.endpoint.desc'),
      placeholder: 'http://127.0.0.1:11434',
      title: t('ollama.endpoint.title'),
    },
  };
};
