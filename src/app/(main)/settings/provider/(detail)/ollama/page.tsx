'use client';

import { useTranslation } from 'react-i18next';

import { OllamaProviderCard } from '@/config/modelProviders';

import ProviderDetail from '../[id]';
import Checker from './Checker';

const Page = () => {
  const { t } = useTranslation('modelProvider');

  return (
    <ProviderDetail
      {...OllamaProviderCard}
      checkerItem={{
        children: <Checker />,
        desc: t('ollama.checker.desc'),
        label: t('ollama.checker.title'),
        minWidth: undefined,
      }}
      settings={{
        ...OllamaProviderCard.settings,
        proxyUrl: {
          desc: t('ollama.endpoint.desc'),
          placeholder: 'http://127.0.0.1:11434',
          title: t('ollama.endpoint.title'),
        },
      }}
    />
  );
};

export default Page;
