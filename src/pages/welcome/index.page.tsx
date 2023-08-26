import { useResponsive } from 'antd-style';
import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Banner from './Banner';
import Footer from './Footer';
import Layout from './layout';
import Mobile from './mobile';

const Welcome = memo(() => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('welcome');
  const pageTitle = genSiteHeadTitle(t('header'));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {mobile ? (
        <Mobile>
          <Banner />
        </Mobile>
      ) : (
        <Layout>
          <Banner />
          <Footer />
        </Layout>
      )}
    </>
  );
});

export default Welcome;
