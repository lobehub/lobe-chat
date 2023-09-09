import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AppMobileLayout from '@/layout/AppMobileLayout';
import Header from '@/pages/chat/features/Header';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Conversation from '../features/Conversation';
import SideBar from '../features/Sidebar';

const Chat = memo(() => {
  const [avatar, title] = useSessionStore((s) => [
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentTitle(s),
  ]);

  const pageTitle = genSiteHeadTitle([avatar, title].filter(Boolean).join(' '));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <AppMobileLayout navBar={<Header />}>
        <Flexbox height={'calc(100vh - 44px)'} horizontal>
          <Conversation mobile />
          <SideBar />
        </Flexbox>
      </AppMobileLayout>
    </>
  );
});
export default Chat;
