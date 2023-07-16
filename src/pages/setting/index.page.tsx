import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { Sessions } from '@/pages/chat/SessionList';

import Sidebar from '../Sidebar';
import Header from './Header';
import SettingForm from './SettingForm';

const SettingLayout = memo(() => {
  const { t } = useTranslation('setting');
  return (
    <>
      <Head>
        <title>{t('header')} - LobeChat</title>
      </Head>
      <Flexbox horizontal width={'100%'}>
        <Sidebar />
        <Sessions />
        <Flexbox flex={1}>
          <Header />
          <Flexbox align={'center'} padding={24}>
            <SettingForm />
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </>
  );
});

export const getServerSideProps = async (context: any) => ({
  props: await serverSideTranslations(context.locale, ['common', 'setting']),
});

export default SettingLayout;
