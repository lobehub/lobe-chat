'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Head from '../Head';
import Conversation from '../features/Conversation';
import Header from './features/ChatHeader';
import SideBar from './features/SideBar';

const DesktopPage = memo(() => {
  return (
    <>
      <Head />
      <Header />
      <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
        <Conversation />
        <SideBar />
      </Flexbox>
    </>
  );
});
export default DesktopPage;
