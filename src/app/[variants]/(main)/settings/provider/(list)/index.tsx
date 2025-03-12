'use client';

import { isCustomBranding } from '@/const/version';

import Footer from './Footer';
import ProviderGrid from './ProviderGrid';

const Page = () => {
  return (
    <>
      <ProviderGrid />
      {!isCustomBranding && <Footer />}
    </>
  );
};

Page.displayName = 'ProviderGrid';

export default Page;
