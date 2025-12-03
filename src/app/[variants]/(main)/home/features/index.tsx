'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import CommunityAgents from './CommunityAgents';
import FeaturedPlugins from './FeaturedPlugins';
import InputArea from './InputArea';
import RecentPage from './RecentPage';
import RecentResource from './RecentResource';
import RecentTopic from './RecentTopic';
import WelcomeText from './WelcomeText';

const Home = memo(() => {
  return (
    <Flexbox gap={48} style={{ paddingBottom: 64 }}>
      <div style={{ height: '32px' }} />
      <WelcomeText />
      <InputArea />
      <RecentTopic />
      <RecentPage />
      <CommunityAgents />
      <FeaturedPlugins />
      <RecentResource />
    </Flexbox>
  );
});

export default Home;
