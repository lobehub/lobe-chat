'use client';

import { useResponsive } from 'antd-style';
import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';

import CategoryContent from './features/CategoryContent';
import Header from './_layout/Desktop/Header';
import SideBar from './_layout/Desktop/SideBar';
import ApiKeyPage from './routes/ApiKeyPage';
import ProfilePage from './routes/ProfilePage';
import SecurityPage from './routes/SecurityPage';
import StatsPage from './routes/StatsPage';

interface ProfileLayoutProps {
  mobile?: boolean;
}

const ProfileLayout = memo<ProfileLayoutProps>(({ mobile }) => {
  const ref = useRef<any>(null);
  const { md = true } = useResponsive();
  const { t } = useTranslation('auth');
  const location = useLocation();

  // Get active tab from pathname
  const getActiveTab = () => {
    const path = location.pathname.replace('/profile', '').replace(/^\//, '');
    return path || 'profile';
  };

  const activeKey = getActiveTab();

  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal={md}
        ref={ref}
        style={{ position: 'relative' }}
        width={'100%'}
      >
        {md ? (
          <SideBar>
            <CategoryContent />
          </SideBar>
        ) : (
          <Header getContainer={() => ref.current} title={<>{t(`tab.${activeKey}`)}</>}>
            <CategoryContent />
          </Header>
        )}
        <SettingContainer
          addonAfter={<Footer />}
          style={{
            paddingBlock: 24,
            paddingInline: 32,
          }}
        >
          <Routes>
            <Route element={<ProfilePage mobile={mobile} />} path="/" />
            <Route element={<StatsPage mobile={mobile} />} path="/stats" />
            <Route element={<ApiKeyPage />} path="/apikey" />
            <Route element={<SecurityPage mobile={mobile} />} path="/security" />
          </Routes>
        </SettingContainer>
      </Flexbox>
      <InitClientDB />
    </>
  );
});

ProfileLayout.displayName = 'ProfileLayout';

const ProfileRouter = memo<ProfileLayoutProps>(({ mobile }) => {
  return (
    <BrowserRouter basename="/profile">
      <ProfileLayout mobile={mobile} />
    </BrowserRouter>
  );
});

ProfileRouter.displayName = 'ProfileRouter';

export default ProfileRouter;
