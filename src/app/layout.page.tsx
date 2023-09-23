import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';
import Layout from 'src/layout/GlobalLayout';

import {
  LOBE_THEME_APPEARANCE,
  LOBE_THEME_NEUTRAL_COLOR,
  LOBE_THEME_PRIMARY_COLOR,
} from '@/const/theme';

import StyleRegistry from './StyleRegistry';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: 'LobeChat',
};

const RootLayout = ({ children }: PropsWithChildren) => {
  // get default theme config to use with ssr
  const cookieStore = cookies();
  const appearance = cookieStore.get(LOBE_THEME_APPEARANCE);
  const neutralColor = cookieStore.get(LOBE_THEME_NEUTRAL_COLOR);
  const primaryColor = cookieStore.get(LOBE_THEME_PRIMARY_COLOR);

  return (
    <html lang="en">
      <body>
        <StyleRegistry>
          <Layout
            defaultAppearance={appearance?.value}
            defaultNeutralColor={neutralColor?.value as any}
            defaultPrimaryColor={primaryColor?.value as any}
          >
            {children}
          </Layout>
        </StyleRegistry>
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
