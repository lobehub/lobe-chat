'use client';

import { Flexbox } from 'react-layout-kit';

import { isCustomBranding } from '@/const/version';

import Footer from './Footer';
import ProviderGrid from './ProviderGrid';

const Page = () => {
  return (
    <Flexbox
      align={'center'}
      gap={24}
      style={{ overflow: 'scroll', paddingBottom: 24 }}
      width={'100%'}
    >
      <ProviderGrid />
      {!isCustomBranding && <Footer />}
    </Flexbox>
  );
};

Page.displayName = 'ProviderGrid';

export default Page;
