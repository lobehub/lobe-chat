'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Conversation from '../features/Conversation';
import PageTitle from '../features/PageTitle';
import ChatHeader from './features/ChatHeader';
import ChatInput from './features/ChatInput';
import SideBar from './features/SideBar';

const DesktopPage = memo(() => {
  return (
    <>
      <PageTitle />
      <ChatHeader />
      <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
        <Conversation chatInput={<ChatInput />} />
        <SideBar />
      </Flexbox>
    </>
  );
});
export default DesktopPage;
