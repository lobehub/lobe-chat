'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ResponsiveIndex from '@/components/ResponsiveIndex';

import Mobile from '../(mobile)';
import Conversation from '../features/Conversation';
import PageTitle from '../features/PageTitle';
import ChatHeader from './features/ChatHeader';
import ChatInput from './features/ChatInput';
import SideBar from './features/SideBar';
import Layout from './layout.responsive';

const DesktopPage = memo(() => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <PageTitle />
      <ChatHeader />
      <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
        <Conversation chatInput={<ChatInput />} />
        <SideBar />
      </Flexbox>
    </Layout>
  </ResponsiveIndex>
));
export default DesktopPage;
