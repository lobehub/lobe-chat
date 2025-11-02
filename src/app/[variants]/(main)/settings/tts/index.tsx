'use client';

import { notFound } from 'next/navigation';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import OpenAI from './features/OpenAI';
import STT from './features/STT';

const Page = () => {
  const { enableSTT } = useServerConfigStore(featureFlagsSelectors);

  if (!enableSTT) {
    notFound();
  }

  return (
    <>
      <STT />
      <OpenAI />
    </>
  );
};

Page.displayName = 'TtsSetting';

export default Page;
