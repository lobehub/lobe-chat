'use client';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';
import { parseAsString, useQueryState } from '@/hooks/useQueryParam';
import { SettingsTabs } from '@/store/global/initialState';

import SettingsContent from '../SettingsContent';
import Header from './Header';

const Layout = () => {
  const [activeTab] = useQueryState('active', parseAsString.withDefault(SettingsTabs.Common));

  return (
    <MobileContentLayout header={<Header />}>
      <SettingsContent activeTab={activeTab} mobile={true} />
      <Footer />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileSettingsLayout';

export default Layout;
