'use client';

import { memo, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Center } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import Loading from '@/components/Loading/BrandTextLoading';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import HomeCategory from './(home)/features/Category';
import HomeHeader from './(home)/features/Header';
import UserBanner from './(home)/features/UserBanner';
import ProfileCategory from './profile/features/Category';
import ProfileHeader from './profile/features/Header';
import SettingsCategory from './settings/features/Category';
import SettingsHeader from './settings/features/Header';

// Home page component
const MeHomePage = memo(() => {
  return (
    <MobileContentLayout header={<HomeHeader />} withNav>
      <Suspense fallback={<Loading />}>
        <UserBanner />
        <HomeCategory />
        <Center padding={16}>
          <BrandWatermark />
        </Center>
      </Suspense>
    </MobileContentLayout>
  );
});

MeHomePage.displayName = 'MeHomePage';

// Profile page component
const MeProfilePage = memo(() => {
  return (
    <MobileContentLayout header={<ProfileHeader />} withNav>
      <Suspense fallback={<Loading />}>
        <ProfileCategory />
      </Suspense>
    </MobileContentLayout>
  );
});

MeProfilePage.displayName = 'MeProfilePage';

// Settings page component
const MeSettingsPage = memo(() => {
  return (
    <MobileContentLayout header={<SettingsHeader />} withNav>
      <Suspense fallback={<Loading />}>
        <SettingsCategory />
      </Suspense>
    </MobileContentLayout>
  );
});

MeSettingsPage.displayName = 'MeSettingsPage';

// Mobile Me Routes
export const MobileMeRoutes = memo(() => {
  return (
    <Routes>
      <Route element={<MeHomePage />} path="/" />
      <Route element={<MeProfilePage />} path="/profile" />
      <Route element={<MeSettingsPage />} path="/settings" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
});

MobileMeRoutes.displayName = 'MobileMeRoutes';
