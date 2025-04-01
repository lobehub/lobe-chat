import { notFound } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactNode } from 'react';

import { isDesktop } from '@/const/version';
import GlobalLayout from '@/layout/GlobalProvider';
import { ServerConfigStoreProvider } from '@/store/serverConfig/Provider';
import { DynamicLayoutProps } from '@/types/next';

interface RootLayoutProps extends DynamicLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  if (!isDesktop) return notFound();

  return (
    <html dir="ltr" suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <ServerConfigStoreProvider>
            <GlobalLayout appearance={'auto'} isMobile={false} locale={''}>
              {children}
            </GlobalLayout>
          </ServerConfigStoreProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
};

export default RootLayout;
