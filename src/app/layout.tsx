import { SpeedInsights } from '@vercel/speed-insights/next';
import { ResolvingViewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';
import { isRtlLang } from 'rtl-detect';

import Analytics from '@/components/Analytics';
import { getServerConfig } from '@/config/server';
import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import GlobalProvider from '@/layout/GlobalProvider';
import { API_ENDPOINTS } from '@/services/_url';
import { isMobileDevice } from '@/utils/responsive';

const { ENABLE_OAUTH_SSO = false } = getServerConfig();

const RootLayout = async ({ children }: PropsWithChildren) => {
  const cookieStore = cookies();

  const lang = cookieStore.get(LOBE_LOCALE_COOKIE);
  const direction = isRtlLang(lang?.value || DEFAULT_LANG) ? 'rtl' : 'ltr';

  const content = ENABLE_OAUTH_SSO ? (
    <SessionProvider basePath={API_ENDPOINTS.oauth}>{children}</SessionProvider>
  ) : (
    children
  );

  return (
    <html dir={direction} lang={lang?.value || DEFAULT_LANG} suppressHydrationWarning>
      <body>
        <GlobalProvider>{content}</GlobalProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;

export { default as metadata } from './metadata';

export const generateViewport = async (): ResolvingViewport => {
  const isMobile = isMobileDevice();

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
