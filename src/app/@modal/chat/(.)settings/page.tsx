'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import qs from 'query-string';

import AgentMeta from '@/features/AgentSetting/AgentMeta';

import { SettingsTabs } from './features/useCategory';
import Skeleton from './loading';

const loading = () => <Skeleton />;

const AgentChat = dynamic(() => import('@/features/AgentSetting/AgentChat'), { loading });

const AgentPrompt = dynamic(() => import('@/features/AgentSetting/AgentPrompt'), { loading });

const AgentPlugin = dynamic(() => import('@/features/AgentSetting/AgentPlugin'), { loading });

const AgentModal = dynamic(() => import('@/features/AgentSetting/AgentModal'), { loading });

const AgentTTS = dynamic(() => import('@/features/AgentSetting/AgentTTS'), { loading });
const Page = () => {
  const rawQuery = useSearchParams();
  const { tab = SettingsTabs.Meta } = qs.parse(rawQuery.toString());
  return (
    <>
      {tab === SettingsTabs.Meta && <AgentMeta />}
      {tab === SettingsTabs.Prompt && <AgentPrompt modal />}
      {tab === SettingsTabs.Chat && <AgentChat />}
      {tab === SettingsTabs.Modal && <AgentModal />}
      {tab === SettingsTabs.TTS && <AgentTTS />}
      {tab === SettingsTabs.Plugin && <AgentPlugin />}
    </>
  );
};

Page.displayName = 'AgentSettingModal';

export default Page;
