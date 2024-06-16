import { Metadata } from 'next';

import { getCanonicalUrl } from '@/const/url';

import Client from './(loading)/Client';
import Redirect from './(loading)/Redirect';

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/') },
};

const Page = () => {
  return (
    <>
      <Client />
      <Redirect />
    </>
  );
};

Page.displayName = 'Loading';

export default Page;
