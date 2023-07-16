import isEqual from 'fast-deep-equal';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { sessionSelectors, useChatStore } from '@/store/session';

import Sidebar from '../Sidebar';
import { Sessions } from '../chat/SessionList';
import Header from './Header';

const SettingLayout = memo(() => {
  const [title] = useChatStore((s) => {
    const context = sessionSelectors.currentSession(s);
    return [context?.meta.title];
  }, isEqual);

  return (
    <>
      <Head>
        <title>{title ? `${title} - LobeChat` : 'LobeChat'}</title>
      </Head>
      <Flexbox horizontal width={'100%'}>
        <Sidebar />
        <Sessions />
        <Flexbox flex={1}>
          <Header />
        </Flexbox>
      </Flexbox>
    </>
  );
});

export const getServerSideProps = async (context: any) => ({
  props: await serverSideTranslations(context.locale, ['common', 'setting']),
});

export default SettingLayout;
