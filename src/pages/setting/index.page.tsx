import Head from 'next/head';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { createI18nNext } from '@/locales/create';
import { settingsLocaleSet } from '@/locales/namespaces';
import { Sessions } from '@/pages/chat/SessionList';

import Sidebar from '../Sidebar';
import Header from './Header';
import SettingForm from './SettingForm';

const initI18n = createI18nNext({ localSet: settingsLocaleSet, namespace: 'setting' });

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

export default SettingLayout;
