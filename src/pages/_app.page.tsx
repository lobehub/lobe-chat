import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';

import Layout from '@/layout';

export default ({ Component, pageProps }: AppProps) => (
  <Layout>
    <Component {...pageProps} />
    <Analytics />
  </Layout>
);
