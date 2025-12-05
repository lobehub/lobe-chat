'use client';

import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useAgentStore } from '@/store/agent';

import AgentBuilder from './features/AgentBuilder';
import Header from './features/Header';
import ProfileEditor from './features/ProfileEditor';
import ProfileProvider from './features/ProfileProvider';
import { useProfileStore } from './features/store';

const ProfileArea = memo(() => {
  const editor = useProfileStore((s) => s.editor);
  return (
    <Flexbox flex={1} height={'100%'}>
      <Header />
      <Flexbox
        height={'100%'}
        horizontal
        onClick={() => editor?.focus()}
        style={{ cursor: 'text', display: 'flex', overflowY: 'auto', position: 'relative' }}
        width={'100%'}
      >
        <WideScreenContainer>
          <ProfileEditor />
        </WideScreenContainer>
      </Flexbox>
    </Flexbox>
  );
});

const AgentProfile = memo(() => {
  // Initialize agent builder builtin agent
  const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.agentBuilder);

  return (
    <ProfileProvider>
      <Flexbox height={'100%'} horizontal width={'100%'}>
        <ProfileArea />
        <AgentBuilder />
      </Flexbox>
    </ProfileProvider>
  );
});

export default AgentProfile;
