'use client';

import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoverAssistantItem, DiscoverModelItem, DiscoverPlugintem } from '@/types/discover';

import Title from '../features/Title';
import AssistantList from './features/AssistantList';
import ModelList from './features/ModelList';
import PluginList from './features/PluginList';

interface ClientProps {
  assistantList: DiscoverAssistantItem[];
  modelList: DiscoverModelItem[];
  pluginList: DiscoverPlugintem[];
}

const Client = memo<ClientProps>(({ modelList, assistantList, pluginList }) => {
  const router = useRouter();
  const { t } = useTranslation('discover');
  return (
    <>
      <Title more={t('home.more')} onMoreClick={() => router.push('/discover/assistants')}>
        {t('home.featuredAssistants')}
      </Title>
      <AssistantList data={assistantList} />
      <div />
      <Title more={t('home.more')} onMoreClick={() => router.push('/discover/plugins')}>
        {t('home.featuredTools')}
      </Title>
      <PluginList data={pluginList} />
      <div />
      <Title more={t('home.more')} onMoreClick={() => router.push('/discover/models')}>
        {t('home.featuredModels')}
      </Title>
      <div />
      <ModelList data={modelList} />
    </>
  );
});

export default Client;
