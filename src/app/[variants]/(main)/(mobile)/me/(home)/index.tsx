'use client';

import { memo } from 'react';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';

import Category from './features/Category';
import UserBanner from './features/UserBanner';

const MeHomePage = memo(() => {
  return (
    <>
      <UserBanner />
      <Category />
      <Center padding={16}>
        <BrandWatermark />
      </Center>
    </>
  );
});

MeHomePage.displayName = 'MeHomePage';

export default MeHomePage;
