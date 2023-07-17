import isEqual from 'fast-deep-equal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

  return (
    <Layout>
      <Head>
        <title>{title ? `${title} - LobeChat` : 'LobeChat'}</title>
      </Head>

      <Flexbox flex={1}>
        <Header />
        <Flexbox
          id={'lobe-conversion-container'}
          style={{ height: 'calc(100vh - 64px)', position: 'relative' }}
        >
          <Conversation />
          <Config />
        </Flexbox>
      </Flexbox>
    </Layout>
  );
});
export default Chat;

// export const getStaticPaths = async () => {
//   return {
//     fallback: 'blocking',
//     paths: [],
//   };
// };

export const getServerSideProps = async (context: any) => ({
  props: await serverSideTranslations(context.locale),
});
