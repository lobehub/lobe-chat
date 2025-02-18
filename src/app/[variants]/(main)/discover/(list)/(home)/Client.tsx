'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoverAssistantItem, DiscoverModelItem, DiscoverPlugintem } from '@/types/discover';

import Title from '../../components/Title';
import AssistantList from './features/AssistantList';
import ModelList from './features/ModelList';
import PluginList from './features/PluginList';

interface ClientProps {
  assistantList: DiscoverAssistantItem[];
  modelList: DiscoverModelItem[];
  pluginList: DiscoverPlugintem[];
}

const Client = memo<ClientProps>(({ modelList, assistantList, pluginList }) => {
  const { t } = useTranslation('discover');
  return (
    <>
      <Title more={t('home.more')} moreLink={'/discover/assistants'}>
        {t('home.featuredAssistants')}
      </Title>
      <AssistantList data={assistantList} />
      <div />
      <Title more={t('home.more')} moreLink={'/discover/plugins'}>
        {t('home.featuredTools')}
      </Title>
      <PluginList data={pluginList} />
      <div />
      <Title more={t('home.more')} moreLink={'/discover/models'}>
        {t('home.featuredModels')}
      </Title>
      <div />
      <ModelList data={modelList} />
    </>
  );
});

export default Client;
