'use client';

import { isServerMode } from '@/const/version';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import SystemAgentForm from './features/createForm';

const Page = () => {
  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);
  return (
    <>
      <SystemAgentForm systemAgentKey="topic" />
      <SystemAgentForm systemAgentKey="translation" />
      <SystemAgentForm systemAgentKey="agentMeta" />
      {isServerMode && enableKnowledgeBase && (
        <SystemAgentForm allowCustomPrompt systemAgentKey="queryRewrite" />
      )}
    </>
  );
};

Page.displayName = 'SystemAgent';

export default Page;
