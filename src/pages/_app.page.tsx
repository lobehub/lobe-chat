import { Analytics } from '@vercel/analytics/react';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';

import Layout from '@/layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  );
}

export default appWithTranslation(MyApp);
