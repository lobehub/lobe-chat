'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Conversation from '@/features/Conversation';
import { useSessionStore } from '@/store/session';

import TelemetryNotification from '../../features/TelemetryNotification';
import ChatInput from '../features/ChatInput';
import ChatHeader from './ChatHeader';

const TopicList = dynamic(() => import('../features/TopicList'));

const Chat = memo(() => {
  // due to mobile side don't have sessionList, so we need to fetch sessions here
  // refs: https://github.com/lobehub/lobe-chat/pull/541
  const useFetchSessions = useSessionStore((s) => s.useFetchSessions);
  useFetchSessions();

  return (
    <>
      <ChatHeader />
      <Flexbox height={'calc(100% - 44px)'} horizontal>
        <Conversation chatInput={<ChatInput />} mobile />
        <TopicList />
        <TelemetryNotification mobile />
      </Flexbox>
    </>
  );
});
export default Chat;
