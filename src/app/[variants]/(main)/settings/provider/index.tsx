'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet, useLoaderData, useNavigate } from 'react-router-dom';

import { ProviderIdParams } from '@/app/[variants]/loaders/routeParams';
import { isCustomBranding } from '@/const/version';

import Footer from './(list)/Footer';
import ProviderMenu from './ProviderMenu';
import DesktopLayoutContainer from './_layout/Desktop/Container';
import ProviderDetailPageComponent from './detail';

// Layout component that wraps provider pages with navigation
export const ProviderLayout = memo(() => {
  const navigate = useNavigate();

  const handleProviderSelect = (providerKey: string) => {
    navigate(`/settings/provider/${providerKey}`);
  };

  return (
    <Flexbox
      horizontal
      style={{
        maxHeight: '100%',
      }}
      width={'100%'}
    >
      <ProviderMenu mobile={false} onProviderSelect={handleProviderSelect} />
      <DesktopLayoutContainer>
        <Outlet />
        {!isCustomBranding && <Footer />}
      </DesktopLayoutContainer>
    </Flexbox>
  );
});

ProviderLayout.displayName = 'ProviderLayout';

// Detail page component that receives providerId from route params
export const ProviderDetailPage = memo(() => {
  const { providerId } = useLoaderData() as ProviderIdParams;
  const navigate = useNavigate();

  const handleProviderSelect = (providerKey: string) => {
    navigate(`/settings/provider/${providerKey}`);
  };

  return <ProviderDetailPageComponent id={providerId} onProviderSelect={handleProviderSelect} />;
});

ProviderDetailPage.displayName = 'ProviderDetailPage';

// Default export for backward compatibility (used by SettingsContent)
type ProviderPageType = {
  mobile?: boolean;
};

const ProviderPage = (props: ProviderPageType) => {
  const { mobile } = props;

  // For mobile or when used via SettingsContent, use the old Page component
  // This is a fallback for non-router usage
  const OldPage = require('./(list)').default;
  return <OldPage mobile={mobile} />;
};

export default ProviderPage;
