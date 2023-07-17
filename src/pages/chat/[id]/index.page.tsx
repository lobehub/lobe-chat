import isEqual from 'fast-deep-equal';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useSessionStore } from '@/store/session';
import { makeI18nProps } from '@/utils/makeI18nProps';

import Layout from '../layout';
import Config from './Config';
import Conversation from './Conversation';
import Header from './Header';

const Chat = memo(() => {
  const { i18n } = useTranslation('common', { bindI18n: 'languageChanged loaded' });
  const [title] = useSessionStore((s) => {
    const context = sessionSelectors.currentSession(s);
    return [context?.meta.title];
  }, isEqual);

  useEffect(() => {
    i18n.reloadResources(i18n.resolvedLanguage, ['common']);
  }, []);

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

export const getStaticProps = makeI18nProps(['common']);

export const getStaticPaths = async () => {
  return {
    fallback: 'blocking',
    paths: [],
  };
};
