'use client';

import { memo, Suspense } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import Category from './features/Category';
import Header from './features/Header';

const MeSettingsPage = memo(() => {
  return (
    <MobileContentLayout header={<Header />} withNav>
      <Suspense fallback={<Loading />}>
        <Category />
      </Suspense>
    </MobileContentLayout>
  );
});

MeSettingsPage.displayName = 'MeSettingsPage';

export default MeSettingsPage;
