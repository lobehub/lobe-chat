import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Banner from './Banner';
import Footer from './Footer';
import Layout from './layout';

const Welcome = memo(() => {
  const { t } = useTranslation('welcome');
  const pageTitle = genSiteHeadTitle(t('header'));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Layout>
        <Banner />
        <Footer />
      </Layout>
    </>
  );
});

export default Welcome;
