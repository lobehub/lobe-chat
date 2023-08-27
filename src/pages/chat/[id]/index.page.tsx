import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Conversation from '../features/Conversation';
import Header from '../features/Header';
import SideBar from '../features/Sidebar';
import Layout from './layout';
import Mobile from './mobile';

const Chat = memo(() => {
  const { mobile } = useResponsive();
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
      {mobile ? (
        <Mobile>
          <Flexbox height={'calc(100vh - 44px)'} horizontal>
            <Conversation mobile />
            <SideBar mobile />
          </Flexbox>
        </Mobile>
      ) : (
        <Layout>
          <Header />
          <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
            <Conversation />
            <SideBar />
          </Flexbox>
        </Layout>
      )}
    </>
  );
});
export default Chat;
