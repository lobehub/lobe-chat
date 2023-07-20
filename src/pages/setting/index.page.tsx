import Head from 'next/head';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HeaderSpacing from '@/features/HeaderSpacing';
import { createI18nNext } from '@/locales/create';
import ChatLayout from '@/pages/chat/layout';

import Header from './Header';
import SettingForm from './SettingForm';

const initI18n = createI18nNext('setting');

const SettingLayout = memo(() => {
  const { t } = useTranslation('setting');
  const pageTitle = `${t('header')} - LobeChat`;

  useEffect(() => {
    initI18n.finally();
  }, []);
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <ChatLayout>
        <Flexbox flex={1}>
          <Header />
          <Flexbox align={'center'} flex={1} padding={24} style={{ overflow: 'auto' }}>
            <HeaderSpacing />
            <SettingForm />
          </Flexbox>
        </Flexbox>
      </ChatLayout>
    </>
  );
});

export default SettingLayout;
