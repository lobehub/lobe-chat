'use client';

import { parseAsString, useQueryState } from 'nuqs';

import { isCustomBranding } from '@/const/version';

import DesktopLayout from '../_layout/Desktop';
import MobileLayout from '../_layout/Mobile';
import ProviderDetailPage from '../detail';
import Footer from './Footer';

const Page = (props: { mobile?: boolean }) => {
  const [Provider, setProvider] = useQueryState('provider', parseAsString.withDefault('all'));
  const { mobile } = props;
  const ProviderLayout = mobile ? MobileLayout : DesktopLayout;
  return (
    <ProviderLayout onProviderSelect={setProvider}>
      <ProviderDetailPage id={Provider} />
      {!isCustomBranding && <Footer />}
    </ProviderLayout>
  );
};

Page.displayName = 'ProviderGrid';

export default Page;
