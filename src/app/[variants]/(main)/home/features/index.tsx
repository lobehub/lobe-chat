'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

import CommunityAgents from './CommunityAgents';
import FeaturedPlugins from './FeaturedPlugins';
import InputArea from './InputArea';
import RecentPage from './RecentPage';
import RecentResource from './RecentResource';
import RecentTopic from './RecentTopic';
import WelcomeText from './WelcomeText';

const Home = memo(() => {
  const isLogin = useUserStore(authSelectors.isLogin);
  return (
    <Flexbox gap={40}>
      <WelcomeText />
      <InputArea />
      {isLogin && (
        <>
          <RecentTopic />
          <RecentPage />
        </>
      )}
      <CommunityAgents />
      <FeaturedPlugins />
      {isLogin && <RecentResource />}
    </Flexbox>
  );
});

export default Home;
