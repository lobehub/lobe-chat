'use client';

import { Ollama } from '@lobehub/icons';
import { useTranslation } from 'react-i18next';

import { OllamaProviderCard } from '@/config/modelProviders';

import { ProviderItem } from '../../type';
import Checker from './Checker';

export const useOllamaProvider = (): ProviderItem => {
  const { t } = useTranslation('modelProvider');

  return {
    ...OllamaProviderCard,
    checkerItem: {
      children: <Checker />,
      desc: t('ollama.checker.desc'),
      label: t('ollama.checker.title'),
      minWidth: undefined,
    },
    proxyUrl: {
      desc: t('ollama.endpoint.desc'),
      placeholder: 'http://127.0.0.1:11434',
      title: t('ollama.endpoint.title'),
    },
    title: <Ollama.Combine size={28} />,
  };
};
