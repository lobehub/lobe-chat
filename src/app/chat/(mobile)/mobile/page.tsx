'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Conversation from '@/features/Conversation';

import SessionHydration from '../../components/SessionHydration';
import TelemetryNotification from '../../features/TelemetryNotification';
import ChatInput from '../features/ChatInput';
import ChatHeader from './ChatHeader';

const TopicList = dynamic(() => import('../features/TopicList'));

const Chat = memo(() => {
  return (
    <>
      <ChatHeader />
      <Flexbox height={'calc(100% - 44px)'} horizontal>
        <Conversation chatInput={<ChatInput />} mobile />
        <TopicList />
        <TelemetryNotification mobile />
      </Flexbox>
      <SessionHydration />
    </>
  );
});
export default Chat;
