'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Conversation from '../../features/Conversation';
import ChatInput from '../features/ChatInput';
import Topics from '../features/Topics';
import Layout from './layout.mobile';

const Chat = memo(() => (
  <Layout>
    <Flexbox height={'calc(100vh - 44px)'} horizontal>
      <Conversation chatInput={<ChatInput />} mobile />
      <Topics />
    </Flexbox>
  </Layout>
));
export default Chat;
