'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ResponsiveIndex from '@/components/ResponsiveIndex';

import PageTitle from '../features/PageTitle';
import ChatHeader from './features/ChatHeader';
import Conversation from './features/Conversation';
import SideBar from './features/SideBar';
import Layout from './layout.desktop';

const Mobile: FC = dynamic(() => import('../(mobile)'), { ssr: false }) as FC;

const DesktopPage = memo(() => (
  <ResponsiveIndex Mobile={Mobile}>
    <Layout>
      <PageTitle />
      <ChatHeader />
      <Flexbox flex={1} height={'calc(100% - 64px)'} horizontal>
        <Conversation />
        <SideBar />
      </Flexbox>
    </Layout>
  </ResponsiveIndex>
));
export default DesktopPage;
