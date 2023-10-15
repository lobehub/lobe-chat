'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ResponsiveIndex from '@/components/ResponsiveIndex';

import Conversation from '../features/Conversation';
import PageTitle from '../features/PageTitle';
import ChatHeader from './features/ChatHeader';
import ChatInput from './features/ChatInput';
import SideBar from './features/SideBar';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

const DesktopPage = memo(() => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <PageTitle />
      <ChatHeader />
      <Flexbox flex={1} height={'calc(100% - 64px)'} horizontal>
        <Conversation chatInput={<ChatInput />} />
        <SideBar />
      </Flexbox>
    </Layout>
  </ResponsiveIndex>
));
export default DesktopPage;
