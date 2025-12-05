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

const AgentProfile = memo(() => {
  // Initialize agent builder builtin agent
  const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
  useInitBuiltinAgent(BUILTIN_AGENT_SLUGS.agentBuilder);

  return (
    <ProfileProvider>
      <Flexbox height={'100%'} horizontal>
        <Flexbox flex={1} height={'100%'}>
          <Header />
          <Flexbox
            height={'100%'}
            horizontal
            style={{ display: 'flex', overflowY: 'auto', position: 'relative' }}
            width={'100%'}
          >
            <WideScreenContainer>
              <ProfileEditor />
            </WideScreenContainer>
          </Flexbox>
        </Flexbox>
        <AgentBuilder />
      </Flexbox>
    </ProfileProvider>
  );
});

export default AgentProfile;
