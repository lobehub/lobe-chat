'use client';

import dynamic from 'next/dynamic';

import { useQuery } from '@/hooks/useQuery';
import { ChatSettingsTabs } from '@/store/global/initialState';

import Skeleton from './loading';

const loading = () => <Skeleton />;

const AgentMeta = dynamic(() => import('@/features/AgentSetting/AgentMeta'), {
  loading,
  ssr: false,
});
const AgentChat = dynamic(() => import('@/features/AgentSetting/AgentChat'), {
  loading,
  ssr: false,
});
const AgentPrompt = dynamic(() => import('@/features/AgentSetting/AgentPrompt'), {
  loading,
  ssr: false,
});
const AgentPlugin = dynamic(() => import('@/features/AgentSetting/AgentPlugin'), {
  loading,
  ssr: false,
});
const AgentModal = dynamic(() => import('@/features/AgentSetting/AgentModal'), {
  loading,
  ssr: false,
});
const AgentTTS = dynamic(() => import('@/features/AgentSetting/AgentTTS'), { loading, ssr: false });

/**
 * @description: Agent Settings Modal (intercepting route: /chat/settings/modal )
 * @refs: https://github.com/lobehub/lobe-chat/discussions/2295#discussioncomment-9290942
 */

const Page = () => {
  const { tab = ChatSettingsTabs.Meta } = useQuery();
  return (
    <>
      {tab === ChatSettingsTabs.Meta && <AgentMeta />}
      {tab === ChatSettingsTabs.Prompt && <AgentPrompt modal />}
      {tab === ChatSettingsTabs.Chat && <AgentChat />}
      {tab === ChatSettingsTabs.Modal && <AgentModal />}
      {tab === ChatSettingsTabs.TTS && <AgentTTS />}
      {tab === ChatSettingsTabs.Plugin && <AgentPlugin />}
    </>
  );
};

Page.displayName = 'AgentSettingModal';

export default Page;
