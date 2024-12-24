import { SpeedInsights } from '@vercel/speed-insights/next';
import { ResolvingViewport } from 'next';
import { ReactNode, Suspense } from 'react';

import Analytics from '@/components/Analytics';
import LobeChatTextLoading from '@/components/LobeChatTextLoading';
import PWAInstall from '@/features/PWAInstall';
import AuthProvider from '@/layout/AuthProvider';
import GlobalProvider from '@/layout/GlobalProvider';
import { isMobileDevice } from '@/utils/server/responsive';

const inVercel = process.env.VERCEL === '1';

type RootLayoutProps = {
  children: ReactNode;
  modal: ReactNode;
};

const RootLayout = async ({ children, modal }: RootLayoutProps) => {
  const mobile = await isMobileDevice();

  return (
    <html suppressHydrationWarning>
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
