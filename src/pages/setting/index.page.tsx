import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Sidebar from '../Sidebar';
import Header from './Header';

const SettingLayout = memo(() => {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t('setting')} - LobeChat</title>
      </Head>
      <Flexbox horizontal width={'100%'}>
        <Sidebar />
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
