'use client';

import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import AgentBuilder from '@/features/AgentBuilder';
import WideScreenContainer from '@/features/WideScreenContainer';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import Header from './features/Header';
import ProfileEditor from './features/ProfileEditor';
import ProfileHydration from './features/ProfileHydration';
import ProfileProvider from './features/ProfileProvider';
import { useProfileStore } from './features/store';

const ProfileArea = memo(() => {
  const editor = useProfileStore((s) => s.editor);
  const isAgentConfigLoading = useAgentStore(agentSelectors.isAgentConfigLoading);

  return (
    <>
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
      <Suspense fallback={null}>
        <ProfileHydration />
      </Suspense>
    </>
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
