'use client';

import dynamic from 'next/dynamic';
import { FC, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ClientResponsiveContent from '@/components/client/ClientResponsiveContent';
import MobileSwitchLoading from '@/features/MobileSwitchLoading';

import PageTitle from '../features/PageTitle';
import ChatHeader from './features/ChatHeader';
import Conversation from './features/Conversation';
import SideBar from './features/SideBar';

const Desktop = memo(() => (
  <>
    <PageTitle />
    <ChatHeader />
    <Flexbox flex={1} height={'calc(100% - 64px)'} horizontal>
      <Conversation />
      <SideBar />
    </Flexbox>
  </>
));

const Mobile = dynamic(() => import('../(mobile)'), {
  loading: MobileSwitchLoading,
  ssr: false,
}) as FC;

export default ClientResponsiveContent({ Desktop, Mobile });
