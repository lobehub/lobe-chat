'use client';

import { useTranslation } from 'react-i18next';

import ProviderConfig from '@/app/(main)/settings/provider/components/ProviderConfig';
import { OllamaProviderCard } from '@/config/modelProviders';

import { ProviderItem } from '../../type';
import Checker from './Checker';

const useProviderCard = (): ProviderItem => {
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
  };
};

const Page = () => {
  const card = useProviderCard();

  return <ProviderConfig {...card} />;
};

export default Page;
