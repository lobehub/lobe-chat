import { cookies, headers } from 'next/headers';
import { PropsWithChildren, Suspense } from 'react';

import { appEnv } from '@/config/app';
import { getServerFeatureFlagsValue } from '@/config/featureFlags';
import { LOBE_LOCALE_COOKIE } from '@/const/locale';
import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';
import DebugUI from '@/features/DebugUI';
import { getServerGlobalConfig } from '@/server/globalConfig';
import { ServerConfigStoreProvider } from '@/store/serverConfig';
import { getAntdLocale, parseBrowserLanguage } from '@/utils/locale';
import { isMobileDevice } from '@/utils/server/responsive';

import AntdV5MonkeyPatch from './AntdV5MonkeyPatch';
import AppTheme from './AppTheme';
import Locale from './Locale';
import QueryProvider from './Query';
import ReactScan from './ReactScan';
import StoreInitialization from './StoreInitialization';
import StyleRegistry from './StyleRegistry';

const GlobalLayout = async ({ children }: PropsWithChildren) => {
  // get default theme config to use with ssr
  const cookieStore = await cookies();
  const appearance = cookieStore.get(LOBE_THEME_APPEARANCE);
  const neutralColor = cookieStore.get(LOBE_THEME_NEUTRAL_COLOR);
  const primaryColor = cookieStore.get(LOBE_THEME_PRIMARY_COLOR);

  // get default locale config to use with ssr
  const defaultLang = cookieStore.get(LOBE_LOCALE_COOKIE);
  const header = await headers();
  const fallbackLang = parseBrowserLanguage(header);

  // if it's a new user, there's no cookie
  // So we need to use the fallback language parsed by accept-language
  const userLocale = defaultLang?.value || fallbackLang;

  const antdLocale = await getAntdLocale(userLocale);

  // get default feature flags to use with ssr
  const serverFeatureFlags = getServerFeatureFlagsValue();
  const serverConfig = getServerGlobalConfig();
  const isMobile = await isMobileDevice();
  return (
    <StyleRegistry>
      <Locale antdLocale={antdLocale} defaultLang={userLocale}>
        <AppTheme
          customFontFamily={appEnv.CUSTOM_FONT_FAMILY}
          customFontURL={appEnv.CUSTOM_FONT_URL}
          defaultAppearance={appearance?.value}
          defaultNeutralColor={neutralColor?.value as any}
          defaultPrimaryColor={primaryColor?.value as any}
          globalCDN={appEnv.CDN_USE_GLOBAL}
        >
          <ServerConfigStoreProvider
            featureFlags={serverFeatureFlags}
            isMobile={isMobile}
            serverConfig={serverConfig}
          >
            <QueryProvider>{children}</QueryProvider>
            <Suspense>
              <StoreInitialization />
              <ReactScan />
            </Suspense>
          </ServerConfigStoreProvider>
          <DebugUI />
        </AppTheme>
        <AntdV5MonkeyPatch />
      </Locale>
    </StyleRegistry>
  );
};

export default GlobalLayout;
