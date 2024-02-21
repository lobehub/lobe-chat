import { Metadata } from 'next';

import { getCanonicalUrl } from '@/const/url';

import Page from './home';
import Redirect from './home/Redirect';

const Index = () => (
  <>
    <Page />
    <Redirect />
  </>
);

export default Index;

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/') },
};
