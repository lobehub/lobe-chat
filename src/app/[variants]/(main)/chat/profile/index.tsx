'use client';

import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useRegisterFilesHotkeys, useSaveDocumentHotkey } from '@/hooks/useHotkeys';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import AgentBuilder from './features/AgentBuilder';
import Header from './features/Header';
import ProfileEditor from './features/ProfileEditor';
import ProfileProvider from './features/ProfileProvider';
import { useProfileStore } from './features/store';

const ProfileArea = memo(() => {
  // Initialize agent builder builtin agent
  const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
  const editor = useProfileStore((s) => s.editor);
  const flushSave = useProfileStore((s) => s.flushSave);
  const isAgentConfigLoading = useAgentStore(agentSelectors.isAgentConfigLoading);
  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.agentBuilder);
  useRegisterFilesHotkeys();
  useSaveDocumentHotkey(flushSave);

  return (
    <Flexbox flex={1} height={'100%'}>
      <Header />
      <Flexbox
        height={'100%'}
        horizontal
        onClick={() => {
          if (isAgentConfigLoading) return;
          editor?.focus();
        }}
        style={{ cursor: 'text', display: 'flex', overflowY: 'auto', position: 'relative' }}
        width={'100%'}
      >
        {isAgentConfigLoading ? (
          <Loading debugId="ProfileArea > AgentConfig" />
        ) : (
          <WideScreenContainer>
            <ProfileEditor />
          </WideScreenContainer>
        )}
      </Flexbox>
    </Flexbox>
  );
});

const AgentProfile = memo(() => {
  return (
    <Suspense fallback={<Loading debugId="AgentProfile" />}>
      <ProfileProvider>
        <Flexbox height={'100%'} horizontal width={'100%'}>
          <ProfileArea />
          <AgentBuilder />
        </Flexbox>
      </ProfileProvider>
    </Suspense>
  );
});

export default AgentProfile;
