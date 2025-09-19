import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeAppearance } from 'antd-style';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactNode } from 'react';

import Analytics from '@/components/Analytics';
import { DEFAULT_LANG } from '@/const/locale';
import AuthProvider from '@/layout/AuthProvider';
import DevPatches from '@/layout/DevPatches';
import GlobalProvider from '@/layout/GlobalProvider';

const inVercel = process.env.VERCEL === '1';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  // Minimal defaults for the standalone payment root
  const locale = DEFAULT_LANG;
  const isMobile = false;
  const theme: ThemeAppearance = 'light';
  const primaryColor = undefined;
  const neutralColor = undefined;

  return (
    <html lang={locale}>
      <body>
        <NuqsAdapter>
          <GlobalProvider
            appearance={theme}
            isMobile={isMobile}
            locale={locale}
            neutralColor={neutralColor as any}
            primaryColor={primaryColor as any}
          >
            <AuthProvider>
              {process.env.NODE_ENV !== 'production' && <DevPatches />}
              {children}
            </AuthProvider>
          </GlobalProvider>
        </NuqsAdapter>
        <Analytics />
        {inVercel && <SpeedInsights />}
      </body>
    </html>
  );
};

export default RootLayout;
