'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import WideScreenContainer from '@/features/ChatList/components/WideScreenContainer';

import Header from './features/Header';
import ProfileEditor from './features/ProfileEditor';
import ProfileProvider from './features/ProfileProvider';

const AgentProfile = memo(() => {
  return (
    <ProfileProvider>
      <Header />
      <Flexbox height={'100%'} style={{ overflowY: 'auto', position: 'relative' }} width={'100%'}>
        <WideScreenContainer>
          <ProfileEditor />
        </WideScreenContainer>
      </Flexbox>
    </ProfileProvider>
  );
});

export default AgentProfile;
