'use client';

import { DEFAULT_REWRITE_QUERY } from '@lobechat/prompts';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import DefaultAgentForm from './features/DefaultAgentForm';
import SystemAgentForm from './features/SystemAgentForm';

const Page = () => {
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  return (
    <>
      <DefaultAgentForm />
      <SystemAgentForm systemAgentKey="topic" />
      <SystemAgentForm systemAgentKey="generationTopic" />
      <SystemAgentForm systemAgentKey="translation" />
      <SystemAgentForm systemAgentKey="historyCompress" />
      <SystemAgentForm systemAgentKey="agentMeta" />
      {enableKnowledgeBase && (
        <SystemAgentForm
          allowCustomPrompt
          allowDisable
          defaultPrompt={DEFAULT_REWRITE_QUERY}
          systemAgentKey="queryRewrite"
        />
      )}
    </>
  );
};

Page.displayName = 'SystemAgent';

export default Page;
