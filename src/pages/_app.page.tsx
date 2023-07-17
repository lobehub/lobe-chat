import { Analytics } from '@vercel/analytics/react';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';

import i18nConfig from '@/../next-i18next.config';
import Layout from '@/layout';

export default appWithTranslation(({ Component, pageProps }: AppProps) => {
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  );
}, i18nConfig);
