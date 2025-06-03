import { ReactNode, Suspense } from 'react';

import { getServerFeatureFlagsValue } from '@/config/featureFlags';
import { appEnv } from '@/envs/app';
import DevPanel from '@/features/DevPanel';
import { getServerGlobalConfig } from '@/server/globalConfig';
import { ServerConfigStoreProvider } from '@/store/serverConfig/Provider';
import { getAntdLocale } from '@/utils/locale';

import AntdV5MonkeyPatch from './AntdV5MonkeyPatch';
import AppTheme from './AppTheme';
import ImportSettings from './ImportSettings';
import Locale from './Locale';
import QueryProvider from './Query';
import ReactScan from './ReactScan';
import StoreInitialization from './StoreInitialization';
import StyleRegistry from './StyleRegistry';

interface GlobalLayoutProps {
  appearance: string;
  children: ReactNode;
  isMobile: boolean;
  locale: string;
  neutralColor?: string;
  primaryColor?: string;
}

const GlobalLayout = async ({
  children,
  neutralColor,
  primaryColor,
  locale: userLocale,
  appearance,
  isMobile,
}: GlobalLayoutProps) => {
  const antdLocale = await getAntdLocale(userLocale);

  // get default feature flags to use with ssr
  const serverFeatureFlags = getServerFeatureFlagsValue();
  const serverConfig = await getServerGlobalConfig();
  return (
    <StyleRegistry>
      <AppTheme
        customFontFamily={appEnv.CUSTOM_FONT_FAMILY}
        customFontURL={appEnv.CUSTOM_FONT_URL}
        defaultAppearance={appearance}
        defaultNeutralColor={neutralColor as any}
        defaultPrimaryColor={primaryColor as any}
        globalCDN={appEnv.CDN_USE_GLOBAL}
      >
        <Locale antdLocale={antdLocale} defaultLang={userLocale}>
          <ServerConfigStoreProvider
            featureFlags={serverFeatureFlags}
            isMobile={isMobile}
            serverConfig={serverConfig}
          >
            <QueryProvider>{children}</QueryProvider>
            <StoreInitialization />
            <Suspense>
              <ImportSettings />
              <ReactScan />
              {process.env.NODE_ENV === 'development' && <DevPanel />}
            </Suspense>
          </ServerConfigStoreProvider>
        </Locale>
      </AppTheme>
      <AntdV5MonkeyPatch />
    </StyleRegistry>
  );
};

export default GlobalLayout;
