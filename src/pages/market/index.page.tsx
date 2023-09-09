import Head from 'next/head';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { genSiteHeadTitle } from '@/utils/genSiteHeadTitle';

import Layout from './layout';

const Market = memo(() => {
  const { t } = useTranslation('common');
  const pageTitle = genSiteHeadTitle(t('tab.market'));

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Layout>
        <h1>🤯 Coming Soon</h1>
      </Layout>
    </>
  );
});

export default Market;
