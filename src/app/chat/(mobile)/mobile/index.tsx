'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Conversation from '../../features/Conversation';
import ChatInput from '../features/ChatInput';
import TopicList from '../features/TopicList';
import Layout from './layout.mobile';

const Chat = memo(() => (
  <Layout>
    <Flexbox height={'calc(100% - 44px)'} horizontal>
      <Conversation chatInput={<ChatInput />} mobile />
      <TopicList />
    </Flexbox>
  </Layout>
));
export default Chat;
