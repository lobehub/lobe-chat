import isEqual from 'fast-deep-equal';
import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useSessionStore } from '@/store/session';

import Layout from '../layout';
import Config from './Config';
import Conversation from './Conversation';
import Header from './Header';

const Chat = memo(() => {
  const [title] = useSessionStore((s) => {
    const context = sessionSelectors.currentSession(s);
    return [context?.meta.title];
  }, isEqual);

  const pageTitle = title ? `${title} - LobeChat` : 'LobeChat';

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Flexbox id={'lobe-conversion-container'} style={{ height: '100vh', position: 'relative' }}>
        <Header />
        <Conversation />
        <Config />
      </Flexbox>
    </Layout>
  );
});
export default Chat;
