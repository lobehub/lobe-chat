import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { agentSelectors, useSessionStore } from '@/store/session';
import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Layout from '../layout';
import Conversation from './Conversation';
import Header from './Header';
import Config from './Sidebar';

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
      <Layout>
        <Flexbox id={'lobe-conversion-container'} style={{ height: '100vh' }}>
          <Header />
          <Flexbox flex={1} height={'calc(100vh - 64px)'} horizontal>
            <Conversation />
            <Config />
          </Flexbox>
        </Flexbox>
      </Layout>
    </>
  );
});
export default Chat;
