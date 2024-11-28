'use client';

import { Flexbox } from 'react-layout-kit';

import { isCustomBranding } from '@/const/version';

import ProviderList from './ProviderList';
import { useProviderList } from './ProviderList/providers';
import ProviderMenu from './ProviderMenu';
import Footer from './features/Footer';

const Page = () => {
  const list = useProviderList();

  return (
    <Flexbox horizontal>
      <ProviderMenu />
      <Flexbox gap={24} style={{ overflow: 'scroll' }} width={'100%'}>
        <ProviderList />
        {!isCustomBranding && <Footer />}
      </Flexbox>
    </Flexbox>
  );
};

Page.displayName = 'ProviderSettings';

export default Page;
