import { Metadata } from 'next';

import { getCanonicalUrl } from '@/const/url';

import Client from './(loading)/Client';
import Redirect from './(loading)/Redirect';

const Page = () => {
  return (
    <>
      <Client />
      <Redirect />
    </>
  );
};

export default Page;

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/') },
};
