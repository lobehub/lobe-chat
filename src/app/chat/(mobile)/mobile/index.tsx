'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';

import Conversation from '../../features/Conversation';
import ChatInput from '../features/ChatInput';
import Layout from './layout.mobile';

const TopicList = dynamic(() => import('../features/TopicList'));

const Chat = memo(() => {
  // due to mobile side don't have sessionList, so we need to fetch sessions here
  // refs: https://github.com/lobehub/lobe-chat/pull/541
  const useFetchSessions = useSessionStore((s) => s.useFetchSessions);
  useFetchSessions();

  return (
    <Layout>
      <Flexbox height={'calc(100% - 44px)'} horizontal>
        <Conversation chatInput={<ChatInput />} mobile />
        <TopicList />
      </Flexbox>
    </Layout>
  );
});
export default Chat;
