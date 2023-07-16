import { Analytics } from '@vercel/analytics/react';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';

import Layout from '@/layout';

const App = appWithTranslation(({ Component, pageProps }: AppProps) => (
  <Component {...pageProps} />
));

export default (props: AppProps) => {
  return (
    <Layout>
      <App {...props} />
      <Analytics />
    </Layout>
  );
};
