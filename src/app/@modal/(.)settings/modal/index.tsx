'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';

import { useQuery } from '@/hooks/useQuery';
import { SettingsTabs } from '@/store/global/initialState';

import Skeleton from './loading';

const loading = () => <Skeleton />;

const Common = dynamic(() => import('@/app/(main)/settings/common'), { loading, ssr: false });
const SystemAgent = dynamic(() => import('@/app/(main)/settings/system-agent'), {
  loading,
  ssr: false,
});
const About = dynamic(() => import('@/app/(main)/settings/about'), { loading, ssr: false });
const LLM = dynamic(() => import('@/app/(main)/settings/llm'), { loading, ssr: false });
const TTS = dynamic(() => import('@/app/(main)/settings/tts'), { loading, ssr: false });
const Agent = dynamic(() => import('@/app/(main)/settings/agent'), { loading, ssr: false });
const Sync = dynamic(() => import('@/app/(main)/settings/sync'), { loading, ssr: false });

interface SettingsModalProps {
  browser?: string;
  mobile?: boolean;
  os?: string;
}

const SettingsModal = memo<SettingsModalProps>(({ browser, os, mobile }) => {
  const { tab = SettingsTabs.Common } = useQuery();
  return (
    <>
      {tab === SettingsTabs.Common && <Common />}
      {tab === SettingsTabs.SystemAgent && <SystemAgent />}
      {tab === SettingsTabs.Sync && <Sync browser={browser} mobile={mobile} os={os} />}
      {tab === SettingsTabs.LLM && <LLM />}
      {tab === SettingsTabs.TTS && <TTS />}
      {tab === SettingsTabs.Agent && <Agent />}
      {tab === SettingsTabs.About && <About mobile={mobile} />}
    </>
  );
});

export default SettingsModal;
