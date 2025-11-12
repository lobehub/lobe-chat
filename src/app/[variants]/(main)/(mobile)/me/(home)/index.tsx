'use client';

import { memo, Suspense } from 'react';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import Loading from '@/components/Loading/BrandTextLoading';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import Category from './features/Category';
import Header from './features/Header';
import UserBanner from './features/UserBanner';

const MeHomePage = memo(() => {
  return (
    <MobileContentLayout header={<Header />} withNav>
      <Suspense fallback={<Loading />}>
        <UserBanner />
        <Category />
        <Center padding={16}>
          <BrandWatermark />
        </Center>
      </Suspense>
    </MobileContentLayout>
  );
});

MeHomePage.displayName = 'MeHomePage';

export default MeHomePage;
