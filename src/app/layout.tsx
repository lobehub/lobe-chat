import { SpeedInsights } from '@vercel/speed-insights/next';
import { ResolvingViewport } from 'next';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { isRtlLang } from 'rtl-detect';

import Analytics from '@/components/Analytics';
import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import PWAInstall from '@/features/PWAInstall';
import AuthProvider from '@/layout/AuthProvider';
import GlobalProvider from '@/layout/GlobalProvider';
import { isMobileDevice } from '@/utils/server/responsive';

const inVercel = process.env.VERCEL === '1';

type RootLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

// 客户端配置
interface HpClientConfig {
  appUrl: string;
  logto: {
    clientId: string;
    issuer: string;
  };
  ssoProvider: string;
}

const RootLayout = async ({ children, modal }: RootLayoutProps) => {
  const cookieStore = await cookies();

  const lang = cookieStore.get(LOBE_LOCALE_COOKIE);
  const locale = lang?.value || DEFAULT_LANG;

  const direction = isRtlLang(locale) ? 'rtl' : 'ltr';
  const mobile = await isMobileDevice();

  const hpClientConfig: HpClientConfig = {
    appUrl: process.env.APP_URL || '',
    logto: {
      clientId: process.env.AUTH_LOGTO_ID || '',
      issuer: process.env.AUTH_LOGTO_ISSUER || '',
    },
    ssoProvider: process.env.NEXT_AUTH_SSO_PROVIDERS || '',
  };

  return (
    <html dir={direction} lang={locale} suppressHydrationWarning>
      <body>
        <GlobalProvider>
          <AuthProvider>
            {children}
            {!mobile && modal}
          </AuthProvider>
          <PWAInstall />
        </GlobalProvider>
        <Analytics />
        {inVercel && <SpeedInsights />}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__HP_CLIENT_CONFIG__ = ${JSON.stringify(hpClientConfig)};`,
          }}
        />
      </body>
    </html>
  );
};

export default RootLayout;

export { generateMetadata } from './metadata';

export const generateViewport = async (): ResolvingViewport => {
  const isMobile = await isMobileDevice();

  const dynamicScale = isMobile ? { maximumScale: 1, userScalable: false } : {};

  return {
    ...dynamicScale,
    initialScale: 1,
    minimumScale: 1,
    themeColor: [
      { color: '#f8f8f8', media: '(prefers-color-scheme: light)' },
      { color: '#000', media: '(prefers-color-scheme: dark)' },
    ],
    viewportFit: 'cover',
    width: 'device-width',
  };
};
