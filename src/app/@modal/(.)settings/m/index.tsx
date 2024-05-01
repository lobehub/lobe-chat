'use client';

import dynamic from 'next/dynamic';

import Common from '@/app/(main)/settings/common';
import { useQuery } from '@/hooks/useQuery';
import { SettingsTabs } from '@/store/global/initialState';

import Skeleton from './loading';

const loading = () => <Skeleton />;
const About = dynamic(() => import('@/app/(main)/settings/about'), { loading });
const LLM = dynamic(() => import('@/app/(main)/settings/llm'), { loading });
const TTS = dynamic(() => import('@/app/(main)/settings/tts'), { loading });
const Agent = dynamic(() => import('@/app/(main)/settings/agent'), { loading });
const Sync = dynamic(() => import('@/app/(main)/settings/sync'), { loading });

const Page = ({ browser, os, mobile }: { browser?: string; mobile?: boolean; os?: string }) => {
  const { tab = SettingsTabs.Common } = useQuery();
  return (
    <>
      {tab === SettingsTabs.Common && <Common />}
      {tab === SettingsTabs.Sync && <Sync browser={browser} mobile={mobile} os={os} />}
      {tab === SettingsTabs.LLM && <LLM />}
      {tab === SettingsTabs.TTS && <TTS />}
      {tab === SettingsTabs.Agent && <Agent />}
      {tab === SettingsTabs.About && <About mobile={mobile} />}
    </>
  );
};

Page.displayName = 'SettingModal';

export default Page;
