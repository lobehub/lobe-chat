'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';
import { SettingsTabs } from '@/store/global/initialState';

import SettingsContent from '../SettingsContent';
import Header from './Header';

const Layout = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(SettingsTabs.Common);

  useEffect(() => {
    const activeParam = searchParams.get('active');
    if (activeParam && Object.values(SettingsTabs).includes(activeParam as SettingsTabs)) {
      setActiveTab(activeParam as SettingsTabs);
    }
  }, [searchParams]);

  return (
    <MobileContentLayout header={<Header />}>
      <SettingsContent activeTab={activeTab} mobile={true} />
      <Footer />
      <InitClientDB />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileSettingsLayout';

export default Layout;
