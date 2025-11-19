'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import SettingsContextProvider from './ContextProvider';

const DesktopSettingsWrapper = memo(() => {
  return (
    <SettingsContextProvider
      value={{
        showOpenAIApiKey: true,
        showOpenAIProxyUrl: true,
      }}
    >
      <Outlet />
    </SettingsContextProvider>
  );
});

DesktopSettingsWrapper.displayName = 'DesktopSettingsWrapper';

export default DesktopSettingsWrapper;
