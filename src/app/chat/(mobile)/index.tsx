'use client';

import { memo } from 'react';

import { useSwitchSideBarOnInit } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

import PageTitle from '../features/PageTitle';
import SessionList from './features/SessionList';
import Layout from './layout.mobile';

const ChatMobilePage = memo(() => {
  useSwitchSideBarOnInit(SidebarTabKey.Chat);
  return (
    <Layout>
      <PageTitle />
      <SessionList />
    </Layout>
  );
});

export default ChatMobilePage;
