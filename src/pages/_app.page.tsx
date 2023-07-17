import { Analytics } from '@vercel/analytics/react';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';

import i18nConfig from '@/../next-i18next.config';
import Layout from '@/layout';

const App = appWithTranslation(
  ({ Component, pageProps }: AppProps) => <Component {...pageProps} />,
  i18nConfig,
);

export default (props: AppProps) => {
  return (
    <Layout>
      <App {...props} />
      <Analytics />
    </Layout>
  );
};
