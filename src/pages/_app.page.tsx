import { Analytics } from '@vercel/analytics/react';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Suspense } from 'react';

import Layout from '@/layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Suspense fallback="loading">
      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </Suspense>
  );
}

export default appWithTranslation(MyApp);
