'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';

import Conversation from '../../features/Conversation';
import Header from '../features/ChatHeader';
import ChatInput from '../features/ChatInput';
import Topics from '../features/Topics';

const Chat = memo(() => (
  <AppMobileLayout navBar={<Header />}>
    <Flexbox height={'calc(100vh - 44px)'} horizontal>
      <Conversation chatInput={<ChatInput />} mobile />
      <Topics />
    </Flexbox>
  </AppMobileLayout>
));
export default Chat;
